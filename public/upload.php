<?php
// upload.php - Place this file in your Hostinger public_html folder
// Ensure you create a folder named 'pdfs' (lowercase) in the same directory.
// Make sure 'pdfs' folder has write permissions (chmod 755 or 777).

header('Access-Control-Allow-Origin: *'); // Allow from any domain (or strict it to yours)
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded']);
    exit;
}

$file = $_FILES['file'];
$uploadDir = __DIR__ . '/pdfs/';

// Create directory if it doesn't exist
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// Sanitize filename
$filename = basename($file['name']);
$filename = preg_replace("/[^a-zA-Z0-9\._-]/", "", $filename); // Remove special chars
$targetPath = $uploadDir . $filename;

// Check for errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo json_encode(['error' => 'Upload failed with error code: ' . $file['error']]);
    exit;
}

// Move file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return the public URL
    // Assumes script is at root/upload.php and files are in root/pdfs/
    // Adjust logic if placed elsewhere
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $publicUrl = "$protocol://$host/pdfs/$filename";
    
    echo json_encode([
        'success' => true,
        'url' => $publicUrl,
        'filename' => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
}
?>
