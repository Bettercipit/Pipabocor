import time
import requests
import numpy as np
import pandas as pd
import joblib
import os

# === SUPABASE REST API CONFIGURATION ===
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://aukvdeuzgmwfnfwbtsse.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw")

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

def predict_location(reg_model, df_features):
    jarak_cm = reg_model.predict(df_features)[0]
    return float(jarak_cm)

def process_data():
    print("[START] ML Service Aktif: Menyiapkan model AI (Classifier & Regressor)...")

    model_path_clf = 'rf_model.pkl'
    model_path_reg = 'rf_regressor.pkl'
    
    if not os.path.exists(model_path_clf) or not os.path.exists(model_path_reg):
        print(f"[ERROR] Model AI tidak ditemukan!")
        print("Silakan jalankan 'python train_rf.py' terlebih dahulu.")
        return

    try:
        rf_model = joblib.load(model_path_clf)
        reg_model = joblib.load(model_path_reg)
        print("[OK] Kedua Model AI (Random Forest) berhasil dimuat.")
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

                # --- 1. EKSTRAK FITUR & PREDIKSI STATUS ---
                df_features = extract_features(s1, s2, s3)
                status, confidence = predict_leak(rf_model, df_features)
                
                # --- 2. PREDIKSI LOKASI (Menggunakan AI Regresi) ---
                lokasi_estimasi = "-"
                if status != "Normal":
                    jarak_cm_ai = predict_location(reg_model, df_features)
                    # Format teks berdasarkan hasil prediksi AI
                    if jarak_cm_ai <= 84.0:
                        lokasi_estimasi = f"Segmen 1 (± {jarak_cm_ai:.1f} cm dari S1)"
                    else:
                        lokasi_estimasi = f"Segmen 2 (± {jarak_cm_ai:.1f} cm dari S1)"

                # --- 3. UPDATE DATA DENGAN HASIL PREDIKSI ---
                supabase_patch(
                    f'/rest/v1/sensor_readings?id=eq.{row_id}',
                    {
                        'status': status,
                        'confidence': float(confidence),
                        'lokasi_estimasi': lokasi_estimasi
                    }
                )

                # --- 4. BUAT ALERT JIKA BOCOR ---
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
