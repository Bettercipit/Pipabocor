import requests

SUPABASE_URL = "https://aukvdeuzgmwfnfwbtsse.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

try:
    # Cek total data sensor_readings
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/sensor_readings?select=id",
        headers={**HEADERS, "Prefer": "count=exact"},
        timeout=10
    )
    total = int(r.headers.get("Content-Range", "0/0").split("/")[-1])
    print(f"Total data di sensor_readings: {total}")

    # Cek data bocor
    r2 = requests.get(
        f'{SUPABASE_URL}/rest/v1/sensor_readings?select=id&status=in.("Bocor Kecil","Bocor Besar")',
        headers={**HEADERS, "Prefer": "count=exact"},
        timeout=10
    )
    bocor = int(r2.headers.get("Content-Range", "0/0").split("/")[-1])
    print(f"Data bocor: {bocor}")

    # Cek data terbaru
    r3 = requests.get(
        f"{SUPABASE_URL}/rest/v1/sensor_readings?select=*&order=id.desc&limit=1",
        headers=HEADERS,
        timeout=10
    )
    data = r3.json()
    if data:
        row = data[0]
        print(f"Data terbaru: ID={row['id']} | S1={row['sensor_1']} S2={row['sensor_2']} S3={row['sensor_3']} | Status={row['status']}")
    else:
        print("Belum ada data di database.")

    print("\n=== KONEKSI SUPABASE REST API BERHASIL! ===")

except Exception as e:
    print(f"Error: {e}")
