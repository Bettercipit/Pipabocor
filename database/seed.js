/**
 * seed.js
 * Populates the leak_detection_db with sample data for demonstration.
 * Requirements: npm install mysql2
 */

const mysql = require('mysql2/promise');

async function seed() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root', // XAMPP default
        password: '', // XAMPP default
        database: 'leak_detection_db'
    });

    console.log('Connected to database. Starting seeding...');

    try {
        // Clear existing data
        await connection.query('DELETE FROM alerts');
        await connection.query('DELETE FROM predictions');
        await connection.query('DELETE FROM processed_features');
        await connection.query('DELETE FROM sensor_readings');

        const now = new Date();
        const recordsCount = 50; // Number of sample points

        for (let i = 0; i < recordsCount; i++) {
            const timestamp = new Date(now.getTime() - (recordsCount - i) * 1000 * 60 * 5); // 5 min intervals
            
            // Generate realistic flow values (Normal state)
            let s1 = 10 + Math.random() * 2;
            let s2 = s1 - (0.2 + Math.random() * 0.3); // Small loss in normal pipe
            let s3 = s2 - (0.2 + Math.random() * 0.3);

            // Simulate a leak at the end of the data
            if (i > 40) {
                s2 = s1 * 0.7; // Large drop
                s3 = s2 * 0.6;
            }

            // 1. Insert sensor reading
            const [readingResult] = await connection.execute(
                'INSERT INTO sensor_readings (sensor_1, sensor_2, sensor_3, timestamp) VALUES (?, ?, ?, ?)',
                [s1, s2, s3, timestamp]
            );
            const readingId = readingResult.insertId;

            // 2. Calculate features
            const df1 = s1 - s2;
            const df2 = s2 - s3;
            const dfTotal = s1 - s3;
            const r12 = s1 !== 0 ? s2 / s1 : 0;
            const r23 = s2 !== 0 ? s3 / s2 : 0;

            await connection.execute(
                'INSERT INTO processed_features (reading_id, delta_f1, delta_f2, delta_total, ratio_12, ratio_23, rolling_avg, variance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [readingId, df1, df2, dfTotal, r12, r23, s1, 0.1]
            );

            // 3. Insert prediction
            let status = 'Normal';
            let confidence = 0.9 + Math.random() * 0.1;

            if (dfTotal > 2) {
                status = 'Bocor Besar';
                confidence = 0.85 + Math.random() * 0.1;
            } else if (dfTotal > 0.8) {
                status = 'Bocor Kecil';
                confidence = 0.75 + Math.random() * 0.1;
            }

            const [predResult] = await connection.execute(
                'INSERT INTO predictions (reading_id, status, confidence, timestamp) VALUES (?, ?, ?, ?)',
                [readingId, status, confidence, timestamp]
            );

            // 4. Create alert if leaking
            if (status !== 'Normal') {
                await connection.execute(
                    'INSERT INTO alerts (message, timestamp) VALUES (?, ?)',
                    [`Terdeteksi ${status} pada aliran pipa!`, timestamp]
                );
            }
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await connection.end();
    }
}

seed();
