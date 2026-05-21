<?php
// backend/api/get_leaks.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config.php';

// Ambil semua data kebocoran, diurutkan dari terbaru
$endpoint = '/rest/v1/sensor_readings?select=id,sensor_1,sensor_2,sensor_3,status,confidence,lokasi_estimasi,timestamp&status=in.("Bocor Kecil","Bocor Besar")&order=timestamp.desc';
$data = supabase_request('GET', $endpoint);

echo json_encode($data ?? []);
?>
