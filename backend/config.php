<?php
// backend/config.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

// === SUPABASE REST API CONFIGURATION ===
define('SUPABASE_URL', 'https://aukvdeuzgmwfnfwbtsse.supabase.co');
define('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1a3ZkZXV6Z213Zm5md2J0c3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMjQ4NjYsImV4cCI6MjA5NDkwMDg2Nn0.vS7SChFVtvX-WNrHLhu3WX5PnN4iFvGzxQjkXPvpTHw');

/**
 * Helper function to call Supabase REST API using cURL
 * @param string $method  HTTP method: GET, POST, PATCH, DELETE
 * @param string $endpoint  Table path, e.g. '/rest/v1/sensor_readings?order=id.desc&limit=1'
 * @param array|null $data  Data payload for POST/PATCH requests
 * @param array $extra_headers  Additional headers (e.g. Prefer)
 * @return array  Decoded JSON response
 */
function supabase_request($method, $endpoint, $data = null, $extra_headers = []) {
    $url = SUPABASE_URL . $endpoint;
    $headers = array_merge([
        'apikey: ' . SUPABASE_KEY,
        'Authorization: Bearer ' . SUPABASE_KEY,
        'Content-Type: application/json',
    ], $extra_headers);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true) ?? [];
}
?>
