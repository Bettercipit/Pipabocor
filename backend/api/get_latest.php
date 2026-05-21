<?php
// backend/api/get_latest.php
require_once '../config.php';

// Ambil 20 data sensor terbaru
$readings = supabase_request('GET', '/rest/v1/sensor_readings?select=*&order=timestamp.desc&limit=20');

// Ambil 5 alert terbaru
$alerts = supabase_request('GET', '/rest/v1/alerts?select=*&order=timestamp.desc&limit=5');

echo json_encode([
    "readings" => array_reverse($readings ?? []),
    "alerts"   => $alerts ?? []
]);
?>
