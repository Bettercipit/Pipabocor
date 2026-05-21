CREATE DATABASE IF NOT EXISTS leak_detection_db;
USE leak_detection_db;

-- Table for raw sensor readings
CREATE TABLE IF NOT EXISTS sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_1 FLOAT NOT NULL,
    sensor_2 FLOAT NOT NULL,
    sensor_3 FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'Normal',
    confidence FLOAT DEFAULT 0,
    lokasi_estimasi VARCHAR(100),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for calculated features (Layer 2)
CREATE TABLE IF NOT EXISTS processed_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reading_id INT,
    delta_f1 FLOAT,     -- S1 - S2
    delta_f2 FLOAT,     -- S2 - S3
    delta_total FLOAT,  -- S1 - S3
    ratio_12 FLOAT,     -- S2 / S1
    ratio_23 FLOAT,     -- S3 / S2
    rolling_avg FLOAT,  -- 10 sample avg
    variance FLOAT,
    FOREIGN KEY (reading_id) REFERENCES sensor_readings(id) ON DELETE CASCADE
);

-- Table for ML predictions (Layer 3)
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reading_id INT,
    status ENUM('Normal', 'Bocor Kecil', 'Bocor Besar') NOT NULL,
    confidence FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    manual_label ENUM('Normal', 'Bocor Kecil', 'Bocor Besar') DEFAULT NULL, -- For Feedback Loop
    FOREIGN KEY (reading_id) REFERENCES sensor_readings(id) ON DELETE CASCADE
);

-- Table for system alerts (Layer 4)
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    status VARCHAR(20) DEFAULT 'Unresolved',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
