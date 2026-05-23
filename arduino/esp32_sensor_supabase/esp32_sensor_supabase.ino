#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // Wajib ditambahkan untuk koneksi HTTPS

// ==========================================
// PENGATURAN WIFI (Ganti dengan WiFi Anda)
// ==========================================
const char* ssid = "@Ruijie-sF6A8"; 
const char* password = "enter_jo";

// ==========================================
// PENGATURAN SUPABASE REST API
// ==========================================
const char* supabaseUrl = "https://aukvdeuzgmwfnfwbtsse.supabase.co/rest/v1/sensor_readings"; 
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw";

// ==========================================
// PENGATURAN PIN SENSOR WATER FLOW
// ==========================================
// Gunakan pin GPIO yang mendukung interrupt
const int sensorPin1 = 34; // S1
const int sensorPin2 = 35; // S2
const int sensorPin3 = 32; // S3

// Variabel untuk menghitung jumlah putaran (pulsa)
volatile int pulseCount1 = 0;
volatile int pulseCount2 = 0;
volatile int pulseCount3 = 0;

// Konstanta kalibrasi sensor (Tergantung jenis sensor, contoh: YF-S201 adalah 7.5)
// Q (L/min) = Frekuensi (Hz) / 7.5
const float calibrationFactor = 7.5;

// Variabel untuk menyimpan nilai liter per menit (L/min)
float flowRate1 = 0.0;
float flowRate2 = 0.0;
float flowRate3 = 0.0;

// Variabel waktu untuk interval perhitungan (milidetik)
unsigned long oldTime = 0;
const unsigned long interval = 2000; // Kirim data setiap 2 detik

// ==========================================
// FUNGSI INTERRUPT UNTUK SENSOR
// ==========================================
void IRAM_ATTR pulseCounter1() { pulseCount1++; }
void IRAM_ATTR pulseCounter2() { pulseCount2++; }
void IRAM_ATTR pulseCounter3() { pulseCount3++; }

void setup() {
  Serial.begin(115200);
  
  // Setup Pin Sensor sebagai INPUT
  pinMode(sensorPin1, INPUT_PULLUP);
  pinMode(sensorPin2, INPUT_PULLUP);
  pinMode(sensorPin3, INPUT_PULLUP);

  // Mendaftarkan fungsi interrupt
  attachInterrupt(digitalPinToInterrupt(sensorPin1), pulseCounter1, FALLING);
  attachInterrupt(digitalPinToInterrupt(sensorPin2), pulseCounter2, FALLING);
  attachInterrupt(digitalPinToInterrupt(sensorPin3), pulseCounter3, FALLING);

  // Koneksi ke WiFi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi");
  while(WiFi.status() != WL_CONNECTED) { 
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Terhubung ke jaringan WiFi dengan IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Jalankan perhitungan setiap 2 detik
  if((millis() - oldTime) > interval) { 
    // Menonaktifkan interrupt sebentar saat menghitung
    detachInterrupt(digitalPinToInterrupt(sensorPin1));
    detachInterrupt(digitalPinToInterrupt(sensorPin2));
    detachInterrupt(digitalPinToInterrupt(sensorPin3));

    // Menghitung L/min: (Pulsa per detik) / Kalibrasi
    // pulseCount adalah total pulsa dalam "interval" ms
    // Frekuensi = (pulseCount * 1000) / interval
    
    // S1
    flowRate1 = ((1000.0 / (millis() - oldTime)) * pulseCount1) / calibrationFactor;
    // S2
    flowRate2 = ((1000.0 / (millis() - oldTime)) * pulseCount2) / calibrationFactor;
    // S3
    flowRate3 = ((1000.0 / (millis() - oldTime)) * pulseCount3) / calibrationFactor;

    oldTime = millis(); // Reset waktu

    // Tampilkan di Serial Monitor
    Serial.printf("Aliran: S1=%.2f L/min | S2=%.2f L/min | S3=%.2f L/min\n", flowRate1, flowRate2, flowRate3);

    // Kirim data ke Server jika WiFi terhubung
    if(WiFi.status() == WL_CONNECTED){
      WiFiClientSecure client;
      client.setInsecure(); // Mengizinkan HTTPS tanpa memverifikasi sertifikat SSL (sangat penting!)
      HTTPClient http;
      
      http.begin(client, supabaseUrl);
      
      // Menambahkan Header yang diminta Supabase
      http.addHeader("Content-Type", "application/json");
      http.addHeader("apikey", supabaseKey);
      String authHeader = "Bearer " + String(supabaseKey);
      http.addHeader("Authorization", authHeader);
      http.addHeader("Prefer", "return=minimal"); // Agar respon lebih cepat

      // Format JSON disesuaikan dengan kolom database Supabase (sensor_1, sensor_2, sensor_3)
      String jsonPayload = "{\"sensor_1\": " + String(flowRate1, 2) + 
                           ", \"sensor_2\": " + String(flowRate2, 2) + 
                           ", \"sensor_3\": " + String(flowRate3, 2) + "}";

      Serial.print("Mengirim Payload JSON: ");
      Serial.println(jsonPayload);

      int httpResponseCode = http.POST(jsonPayload);
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode); // Sukses biasanya 201 (Created)
        String payload = http.getString();
        Serial.println("Respons dari server: " + payload);
      } else {
        Serial.print("Error saat mengirim POST: ");
        Serial.println(httpResponseCode);
        Serial.println(http.errorToString(httpResponseCode)); // Memunculkan alasan error jika gagal
      }
      http.end(); // Bebaskan resource
    } else {
      Serial.println("Koneksi WiFi terputus");
      // Coba koneksi ulang jika diperlukan
      // WiFi.begin(ssid, password);
    }

    // Reset hitungan pulsa dan aktifkan kembali interrupt
    pulseCount1 = 0;
    pulseCount2 = 0;
    pulseCount3 = 0;
    attachInterrupt(digitalPinToInterrupt(sensorPin1), pulseCounter1, FALLING);
    attachInterrupt(digitalPinToInterrupt(sensorPin2), pulseCounter2, FALLING);
    attachInterrupt(digitalPinToInterrupt(sensorPin3), pulseCounter3, FALLING);
  }
}
