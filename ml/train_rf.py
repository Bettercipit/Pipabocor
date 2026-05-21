import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

def generate_synthetic_data(num_samples=5000):
    print(f"Men-generate {num_samples} data sintetis...")
    
    data = []
    for _ in range(num_samples):
        # Base flow S1 (normal operation around 8-12 L/min)
        s1 = np.random.uniform(8.0, 12.0)
        
        # Tentukan tipe data secara acak
        leak_type = np.random.choice(["Normal", "Bocor Kecil", "Bocor Besar"], p=[0.5, 0.3, 0.2])
        
        if leak_type == "Normal":
            # Selisih sangat kecil (noise alami)
            drop1 = np.random.uniform(0.0, 0.15)
            drop2 = np.random.uniform(0.0, 0.15)
            while (drop1 + drop2) > 0.2:
                drop1 = np.random.uniform(0.0, 0.15)
                drop2 = np.random.uniform(0.0, 0.15)
        elif leak_type == "Bocor Kecil":
            # Selisih medium
            drop1 = np.random.uniform(0.1, 0.4)
            drop2 = np.random.uniform(0.1, 0.4)
            # Pastikan total drop masuk kategori Bocor Kecil (0.2 - 0.5)
            while (drop1 + drop2) <= 0.2 or (drop1 + drop2) > 0.5:
                drop1 = np.random.uniform(0.1, 0.4)
                drop2 = np.random.uniform(0.1, 0.4)
        else: # Bocor Besar
            # Selisih besar
            drop1 = np.random.uniform(0.2, 1.5)
            drop2 = np.random.uniform(0.2, 1.5)
            # Pastikan total drop > 0.5
            while (drop1 + drop2) <= 0.5:
                drop1 = np.random.uniform(0.2, 1.5)
                drop2 = np.random.uniform(0.2, 1.5)
                
        s2 = s1 - drop1
        s3 = s2 - drop2
        
        # 9 Fitur Utama
        f1, f2, f3 = s1, s2, s3
        df_seg1 = f1 - f2
        df_seg2 = f2 - f3
        df_total = f1 - f3
        
        # Handle division by zero untuk ratio
        ratio1 = f2 / f1 if f1 > 0 else 0
        ratio2 = f3 / f2 if f2 > 0 else 0
        
        variance = np.var([f1, f2, f3])
        
        # Labeling (mengikuti logika awal)
        if df_total > 0.5:
            label = "Bocor Besar"
        elif df_total > 0.2:
            label = "Bocor Kecil"
        else:
            label = "Normal"
            
        data.append([f1, f2, f3, df_seg1, df_seg2, df_total, ratio1, ratio2, variance, label])
        
    df = pd.DataFrame(data, columns=['F1', 'F2', 'F3', 'delta_f1', 'delta_f2', 'delta_total', 'ratio1', 'ratio2', 'variance', 'label'])
    return df

def train_model():
    # 1. Generate Data (Ditingkatkan menjadi 50,000 dataset)
    df = generate_synthetic_data(50000)
    
    # Export dataset ke bentuk fisik CSV agar bisa dilihat user
    csv_filename = "dataset_pipa_bocor.csv"
    df.to_csv(csv_filename, index=False)
    print(f"[OK] Dataset berhasil diekspor menjadi wujud fisik: {csv_filename}")
    
    X = df.drop('label', axis=1)
    y = df['label']
    
    # 2. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Mulai proses training Random Forest dengan dataset yang lebih besar...")
    # 3. Inisialisasi dan Train Model
    # Meningkatkan n_estimators dan max_depth untuk meningkatkan akurasi
    rf_model = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    # 4. Evaluasi Model
    print("\nEvaluasi Model:")
    y_pred = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100
    print(f"Accuracy: {accuracy:.4f}%")
    print(classification_report(y_test, y_pred))
    
    # 5. Simpan Model
    model_filename = 'rf_model.pkl'
    joblib.dump(rf_model, model_filename)
    print(f"[OK] Model berhasil disimpan sebagai '{model_filename}'")

if __name__ == "__main__":
    train_model()
