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

    # 2. BOCOR KECIL SEGMEN 1
    input("\n[LANGKAH 2] Putar sedikit/sedang keran PERTAMA Anda (BOCOR KECIL SEGMEN 1). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Kecil Segmen 1 selama 15 detik...")
    time.sleep(15)
    data_kecil_1 = ambil_data_sensor()
    if data_kecil_1:
        hasil_kalibrasi["bocor_kecil_1"] = {"s1": data_kecil_1[0], "s2": data_kecil_1[1], "s3": data_kecil_1[2]}
        print(f"✅ Terekam BOCOR KECIL SEGMEN 1 -> S1: {data_kecil_1[0]:.2f}, S2: {data_kecil_1[1]:.2f}, S3: {data_kecil_1[2]:.2f}")
    else:
        return

    # 3. BOCOR BESAR SEGMEN 1
    input("\n[LANGKAH 3] Putar FULL keran PERTAMA Anda (BOCOR BESAR SEGMEN 1). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Besar Segmen 1 selama 15 detik...")
    time.sleep(15)
    data_besar_1 = ambil_data_sensor()
    if data_besar_1:
        hasil_kalibrasi["bocor_besar_1"] = {"s1": data_besar_1[0], "s2": data_besar_1[1], "s3": data_besar_1[2]}
        print(f"✅ Terekam BOCOR BESAR SEGMEN 1 -> S1: {data_besar_1[0]:.2f}, S2: {data_besar_1[1]:.2f}, S3: {data_besar_1[2]:.2f}")
    else:
        return

    # 4. BOCOR KECIL SEGMEN 2
    input("\n[LANGKAH 4] Tutup keran pertama, lalu putar sedikit/sedang keran KEDUA Anda (BOCOR KECIL SEGMEN 2). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Kecil Segmen 2 selama 15 detik...")
    time.sleep(15)
    data_kecil_2 = ambil_data_sensor()
    if data_kecil_2:
        hasil_kalibrasi["bocor_kecil_2"] = {"s1": data_kecil_2[0], "s2": data_kecil_2[1], "s3": data_kecil_2[2]}
        print(f"✅ Terekam BOCOR KECIL SEGMEN 2 -> S1: {data_kecil_2[0]:.2f}, S2: {data_kecil_2[1]:.2f}, S3: {data_kecil_2[2]:.2f}")
    else:
        return

    # 5. BOCOR BESAR SEGMEN 2
    input("\n[LANGKAH 5] Putar FULL keran KEDUA Anda (BOCOR BESAR SEGMEN 2). Tunggu aliran stabil, lalu tekan ENTER...")
    print("Merekam data Bocor Besar Segmen 2 selama 15 detik...")
    time.sleep(15)
    data_besar_2 = ambil_data_sensor()
    if data_besar_2:
        hasil_kalibrasi["bocor_besar_2"] = {"s1": data_besar_2[0], "s2": data_besar_2[1], "s3": data_besar_2[2]}
        print(f"✅ Terekam BOCOR BESAR SEGMEN 2 -> S1: {data_besar_2[0]:.2f}, S2: {data_besar_2[1]:.2f}, S3: {data_besar_2[2]:.2f}")
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
