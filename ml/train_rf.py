import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, mean_absolute_error
import joblib

def generate_synthetic_data(num_samples=50000):
    print(f"Men-generate {num_samples} data sintetis untuk AI Klasifikasi dan Regresi...")
    
    data = []
    for _ in range(num_samples):
        # Base flow S1 (real world flow is around 1.0 - 2.5 L/min)
        true_s1 = np.random.uniform(1.0, 2.5)
        
        # Tentukan tipe data secara acak
        leak_type = np.random.choice(["Normal", "Bocor Kecil", "Bocor Besar"], p=[0.5, 0.3, 0.2])
        
        if leak_type == "Normal":
            drop1 = np.random.uniform(0.0, 0.05)
            drop2 = np.random.uniform(0.0, 0.05)
            while (drop1 + drop2) > 0.1:
                drop1 = np.random.uniform(0.0, 0.05)
                drop2 = np.random.uniform(0.0, 0.05)
        elif leak_type == "Bocor Kecil":
            drop1 = np.random.uniform(0.05, 0.4)
            drop2 = np.random.uniform(0.05, 0.4)
            while (drop1 + drop2) <= 0.1 or (drop1 + drop2) > 0.55:
                drop1 = np.random.uniform(0.05, 0.4)
                drop2 = np.random.uniform(0.05, 0.4)
        else: # Bocor Besar
            drop1 = np.random.uniform(0.3, 1.5)
            drop2 = np.random.uniform(0.3, 1.5)
            while (drop1 + drop2) <= 0.55:
                drop1 = np.random.uniform(0.3, 1.5)
                drop2 = np.random.uniform(0.3, 1.5)
                
        # Simulasikan kebocoran lebih dominan di salah satu segmen secara acak
        # Agar AI bisa membedakan Segmen 1 atau Segmen 2
        segmen_bocor = np.random.choice([1, 2])
        if leak_type != "Normal":
            if segmen_bocor == 1:
                drop2 = np.random.uniform(0.0, 0.05)
            else:
                drop1 = np.random.uniform(0.0, 0.05)

        true_s2 = true_s1 - drop1
        true_s3 = true_s2 - drop2
        
        # Terapkan scaling hardware asli: S2 terbaca ~40%, S3 terbaca ~50%
        # Ini penting agar AI tidak bingung saat melihat S3 > S2 di dunia nyata
        f1 = true_s1
        f2 = true_s2 * 0.4
        f3 = true_s3 * 0.5
        
        # 9 Fitur Utama
        df_seg1 = f1 - f2
        df_seg2 = f2 - f3
        df_total = f1 - f3
        
        ratio1 = f2 / f1 if f1 > 0 else 0
        ratio2 = f3 / f2 if f2 > 0 else 0
        variance = np.var([f1, f2, f3])
        
        # Label Klasifikasi menggunakan Total True Drop
        true_total_drop = drop1 + drop2
        if true_total_drop > 0.55:
            label_status = "Bocor Besar"
        elif true_total_drop > 0.1:
            label_status = "Bocor Kecil"
        else:
            label_status = "Normal"
            
        # Label Regresi (Jarak CM) - Menggunakan rumus hidrodinamika yang dibalik 
        # menjadi Ground Truth agar dipelajari secara sempurna oleh AI Regressor
        SEGMEN_LEN = 84.0
        jarak_cm = 0.0
        
        if label_status != "Normal":
            if (df_seg1 + 0.1) >= df_seg2:
                rasio = df_seg1 / f1 if f1 > 0 else 0.5
                jarak_kotor = (1.0 - rasio) * SEGMEN_LEN
                jarak_cm = min(SEGMEN_LEN - 5.0, max(5.0, jarak_kotor))
            else:
                rasio = df_seg2 / f2 if f2 > 0 else 0.5
                jarak_kotor = (1.0 - rasio) * SEGMEN_LEN
                jarak_cm = SEGMEN_LEN + min(SEGMEN_LEN - 5.0, max(5.0, jarak_kotor))
            
            # Tambahkan sedikit noise alami (+- 1 cm) agar AI benar-benar "berpikir" 
            # dan tidak hanya sekadar menghafal rumus
            jarak_cm = jarak_cm + np.random.uniform(-1.0, 1.0)
            jarak_cm = max(0.0, jarak_cm)
            
        data.append([f1, f2, f3, df_seg1, df_seg2, df_total, ratio1, ratio2, variance, label_status, round(jarak_cm, 2)])
        
    df = pd.DataFrame(data, columns=['F1', 'F2', 'F3', 'delta_f1', 'delta_f2', 'delta_total', 'ratio1', 'ratio2', 'variance', 'label_status', 'jarak_cm'])
    return df

def train_models():
    # 1. Generate Data
    df = generate_synthetic_data(50000)
    
    csv_filename = "dataset_pipa_bocor.csv"
    df.to_csv(csv_filename, index=False)
    print(f"[OK] Dataset berhasil diekspor menjadi wujud fisik: {csv_filename}")
    
    # === PELATIHAN MODEL 1: KLASIFIKASI (STATUS) ===
    print("\n--- Memulai Training AI Model 1: Classifier (Status) ---")
    X_clf = df.drop(['label_status', 'jarak_cm'], axis=1)
    y_clf = df['label_status']
    
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_clf, y_clf, test_size=0.2, random_state=42)
    
    clf_model = RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
    clf_model.fit(X_train_c, y_train_c)
    
    y_pred_c = clf_model.predict(X_test_c)
    acc = accuracy_score(y_test_c, y_pred_c) * 100
    print(f"Accuracy Classifier: {acc:.2f}%")
    
    joblib.dump(clf_model, 'rf_model.pkl')
    print("[OK] Classifier disimpan sebagai 'rf_model.pkl'")
    
    # === PELATIHAN MODEL 2: REGRESI (LOKASI CM) ===
    print("\n--- Memulai Training AI Model 2: Regressor (Jarak cm) ---")
    # Hanya latih regresi pada data yang memang BOCOR
    df_bocor = df[df['label_status'] != "Normal"]
    X_reg = df_bocor.drop(['label_status', 'jarak_cm'], axis=1)
    y_reg = df_bocor['jarak_cm']
    
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
    
    reg_model = RandomForestRegressor(n_estimators=200, max_depth=20, random_state=42, n_jobs=-1)
    reg_model.fit(X_train_r, y_train_r)
    
    y_pred_r = reg_model.predict(X_test_r)
    mae = mean_absolute_error(y_test_r, y_pred_r)
    print(f"Mean Absolute Error Regressor: meleset rata-rata {mae:.2f} cm")
    
    joblib.dump(reg_model, 'rf_regressor.pkl')
    print("[OK] Regressor disimpan sebagai 'rf_regressor.pkl'")

if __name__ == "__main__":
    train_models()
