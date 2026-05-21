import time
import requests
import numpy as np
import pandas as pd
import joblib
import os

# === SUPABASE REST API CONFIGURATION ===
SUPABASE_URL = "https://aukvdeuzgmwfnfwbtsse.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def supabase_get(endpoint):
    try:
        r = requests.get(f"{SUPABASE_URL}{endpoint}", headers=HEADERS, timeout=10)
        return r.json()
    except Exception as e:
        print(f"[GET Error] {e}")
        return None

def supabase_patch(endpoint, data):
    try:
        r = requests.patch(
            f"{SUPABASE_URL}{endpoint}",
            headers={**HEADERS, "Prefer": "return=representation"},
            json=data,
            timeout=10
        )
        return r.json()
    except Exception as e:
        print(f"[PATCH Error] {e}")
        return None

def supabase_post(endpoint, data):
    try:
        r = requests.post(
            f"{SUPABASE_URL}{endpoint}",
            headers={**HEADERS, "Prefer": "return=representation"},
            json=data,
            timeout=10
        )
        return r.json()
    except Exception as e:
        print(f"[POST Error] {e}")
        return None

def extract_features(s1, s2, s3):
    f1, f2, f3 = float(s1), float(s2), float(s3)
    df_seg1 = f1 - f2
    df_seg2 = f2 - f3
    df_total = f1 - f3
    ratio1 = f2 / f1 if f1 > 0 else 0
    ratio2 = f3 / f2 if f2 > 0 else 0
    variance = np.var([f1, f2, f3])
    features_array = np.array([[f1, f2, f3, df_seg1, df_seg2, df_total, ratio1, ratio2, variance]])
    feature_names = ['F1', 'F2', 'F3', 'delta_f1', 'delta_f2', 'delta_total', 'ratio1', 'ratio2', 'variance']
    return pd.DataFrame(features_array, columns=feature_names)

def predict_leak(rf_model, df_features):
    prediction = rf_model.predict(df_features)[0]
    probabilities = rf_model.predict_proba(df_features)[0]
    confidence = max(probabilities)
    return prediction, round(confidence, 2)

def hitung_estimasi_lokasi(s1, s2, s3, status):
    if status == "Normal":
        return "-"
    s1, s2, s3 = float(s1), float(s2), float(s3)
    df_seg1 = s1 - s2
    df_seg2 = s2 - s3
    SEGMEN_LEN = 84.0
    if df_seg1 >= df_seg2:
        rasio = df_seg1 / s1 if s1 > 0 else 0.5
        jarak_kotor = (1.0 - rasio) * SEGMEN_LEN
        jarak_final = min(SEGMEN_LEN - 5.0, max(5.0, jarak_kotor))
        return f"Segmen 1 (± {jarak_final:.1f} cm dari S1)"
    else:
        rasio = df_seg2 / s2 if s2 > 0 else 0.5
        jarak_dari_s2 = (1.0 - rasio) * SEGMEN_LEN
        jarak_final_s2 = min(SEGMEN_LEN - 5.0, max(5.0, jarak_dari_s2))
        total_jarak = SEGMEN_LEN + jarak_final_s2
        return f"Segmen 2 (± {total_jarak:.1f} cm dari S1)"

def process_data():
    print("[START] ML Service Aktif: Menyiapkan model...")

    model_path = 'rf_model.pkl'
    if not os.path.exists(model_path):
        print(f"[ERROR] Model '{model_path}' tidak ditemukan!")
        print("Silakan jalankan 'python train_rf.py' terlebih dahulu.")
        return

    try:
        rf_model = joblib.load(model_path)
        print("[OK] Random Forest Model berhasil dimuat.")
    except Exception as e:
        print(f"[ERROR] Error memuat model: {e}")
        return

    print("[WAIT] Menunggu data REAL dari Arduino (via Supabase REST API)...")
    while True:
        try:
            # Ambil 1 data terbaru yang belum diprediksi (status NULL atau kosong)
            data = supabase_get(
                '/rest/v1/sensor_readings?select=*&or=(status.is.null,status.eq.)&order=id.desc&limit=1'
            )

            # Fallback: ambil data terbaru jika tidak ada yang belum diproses
            if not data:
                data = supabase_get(
                    '/rest/v1/sensor_readings?select=*&order=id.desc&limit=1'
                )

            if data and len(data) > 0:
                row = data[0]
                s1 = row['sensor_1']
                s2 = row['sensor_2']
                s3 = row['sensor_3']
                row_id = row['id']

                # --- 1. EKSTRAK FITUR & PREDIKSI ---
                df_features = extract_features(s1, s2, s3)
                status, confidence = predict_leak(rf_model, df_features)
                lokasi_estimasi = hitung_estimasi_lokasi(s1, s2, s3, status)

                # --- 2. UPDATE DATA DENGAN HASIL PREDIKSI ---
                supabase_patch(
                    f'/rest/v1/sensor_readings?id=eq.{row_id}',
                    {
                        'status': status,
                        'confidence': float(confidence),
                        'lokasi_estimasi': lokasi_estimasi
                    }
                )

                # --- 3. BUAT ALERT JIKA BOCOR ---
                if status != 'Normal':
                    pesan_alert = f"Kebocoran ({status}) terdeteksi pada {lokasi_estimasi} dengan akurasi {confidence*100:.0f}%"
                    supabase_post('/rest/v1/alerts', {'message': pesan_alert})
                    print(f"[ALERT DIBUAT]: {pesan_alert}")

                print(f"[{row.get('timestamp', '-')}] S1:{s1:.1f} S2:{s2:.1f} S3:{s3:.1f} | Status: {status} ({confidence*100}%) | Lokasi: {lokasi_estimasi}")

        except Exception as e:
            print(f"[Error] {e}")

        time.sleep(1)

if __name__ == "__main__":
    process_data()
