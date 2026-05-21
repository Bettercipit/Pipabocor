<?php
// backend/api/delete_leak.php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    http_response_code(200);
    exit();
}
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit();
}

// Hanya hapus jika status memang bocor
$endpoint = '/rest/v1/sensor_readings?id=eq.' . $id . '&status=in.("Bocor Kecil","Bocor Besar")';
supabase_request('DELETE', $endpoint, null, ['Prefer: return=representation']);

// Supabase DELETE tidak mengembalikan jumlah baris, anggap sukses jika tidak ada error
echo json_encode(['success' => true, 'message' => 'Data berhasil dihapus']);
?>
