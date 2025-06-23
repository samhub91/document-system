<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once "db.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw);

if (empty($data->id) || !isset($data->document_stage)) {
    echo json_encode(["success" => false, "message" => "Missing id or document_stage"]);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE client_service_requests SET document_stage = ? WHERE id = ?");
    $success = $stmt->execute([
        json_encode($data->document_stage),
        $data->id
    ]);
    echo json_encode(["success" => $success]);
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
