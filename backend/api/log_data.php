<?php
// backend/api/log_data.php
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

$s1 = isset($input['s1']) ? (float)$input['s1'] : 0.0;
$s2 = isset($input['s2']) ? (float)$input['s2'] : 0.0;
$s3 = isset($input['s3']) ? (float)$input['s3'] : 0.0;

// Insert ke Supabase dan minta data yang baru diinsert dikembalikan
$result = supabase_request('POST', '/rest/v1/sensor_readings', [
    'sensor_1' => $s1,
    'sensor_2' => $s2,
    'sensor_3' => $s3,
], ['Prefer: return=representation']);

if (!empty($result) && isset($result[0]['id'])) {
    echo json_encode([
        "success"    => true,
        "reading_id" => $result[0]['id'],
        "message"    => "Data diterima. Menunggu proses ML."
    ]);
} else {
    echo json_encode(["error" => "Gagal menyimpan data"]);
}
?>
