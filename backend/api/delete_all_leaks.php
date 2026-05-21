<?php
// backend/api/delete_all_leaks.php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    http_response_code(200);
    exit();
}
require_once '../config.php';

// Hapus semua data kebocoran
$endpoint = '/rest/v1/sensor_readings?status=in.("Bocor Kecil","Bocor Besar")';
supabase_request('DELETE', $endpoint);

echo json_encode(['success' => true, 'message' => 'Semua data kebocoran berhasil dihapus']);
?>
