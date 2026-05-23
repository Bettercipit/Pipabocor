import time
import requests
import json
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://aukvdeuzgmwfnfwbtsse.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def ambil_data_sensor():
    """Mengambil 5 data terbaru dari Supabase"""
    try:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/sensor_readings?select=*&order=id.desc&limit=15",
            headers=HEADERS, timeout=10
        )
        data = r.json()
        if not data or len(data) == 0:
            return None
        
        # Hitung rata-rata dari 5 data terakhir
        s1_avg = sum(d['sensor_1'] for d in data) / len(data)
        s2_avg = sum(d['sensor_2'] for d in data) / len(data)
        s3_avg = sum(d['sensor_3'] for d in data) / len(data)
        return s1_avg, s2_avg, s3_avg
    except Exception as e:
        print(f"Error mengambil data: {e}")
        return None

def main():
    print("="*50)
    print("PROGRAM KALIBRASI AI OTOMATIS")
    print("="*50)
    print("Program ini akan merekam angka sensor Anda secara langsung")
    print("untuk diajarkan ke AI.")
    
    hasil_kalibrasi = {}

    # 1. NORMAL
    input("\n[LANGKAH 1] Nyalakan pompa dan tutup semua keran (Kondisi NORMAL). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Normal selama 15 detik...")
    time.sleep(15)
    data_normal = ambil_data_sensor()
    if data_normal:
        hasil_kalibrasi["normal"] = {"s1": data_normal[0], "s2": data_normal[1], "s3": data_normal[2]}
        print(f"✅ Terekam NORMAL -> S1: {data_normal[0]:.2f}, S2: {data_normal[1]:.2f}, S3: {data_normal[2]:.2f}")
    else:
        print("Gagal mengambil data dari database.")
        return

    # 2. BOCOR KECIL
    input("\n[LANGKAH 2] Putar sedikit/sedang keran pertama Anda (Kondisi BOCOR KECIL). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Kecil selama 15 detik...")
    time.sleep(15)
    data_kecil = ambil_data_sensor()
    if data_kecil:
        hasil_kalibrasi["bocor_kecil"] = {"s1": data_kecil[0], "s2": data_kecil[1], "s3": data_kecil[2]}
        print(f"✅ Terekam BOCOR KECIL -> S1: {data_kecil[0]:.2f}, S2: {data_kecil[1]:.2f}, S3: {data_kecil[2]:.2f}")
    else:
        return

    # 3. BOCOR BESAR
    input("\n[LANGKAH 3] Putar FULL keran pertama Anda (Kondisi BOCOR BESAR). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Besar selama 15 detik...")
    time.sleep(15)
    data_besar = ambil_data_sensor()
    if data_besar:
        hasil_kalibrasi["bocor_besar"] = {"s1": data_besar[0], "s2": data_besar[1], "s3": data_besar[2]}
        print(f"✅ Terekam BOCOR BESAR -> S1: {data_besar[0]:.2f}, S2: {data_besar[1]:.2f}, S3: {data_besar[2]:.2f}")
    else:
        return

    # SIMPAN KE FILE
    with open("kalibrasi.json", "w") as f:
        json.dump(hasil_kalibrasi, f, indent=4)
        
    print("\n" + "="*50)
    print("KALIBRASI SELESAI!")
    print("Data telah berhasil direkam ke file 'kalibrasi.json'.")
    print("Silakan kembali ke chat dan beri tahu AI bahwa Anda sudah selesai!")
    print("="*50)

if __name__ == "__main__":
    main()
