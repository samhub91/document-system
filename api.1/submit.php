<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once "db.php";  // Assumes $pdo is defined here

// Log the raw POST body for debugging
$raw = file_get_contents("php://input");
file_put_contents("log.txt", "RAW: " . $raw . "\n", FILE_APPEND);

$data = json_decode($raw);
file_put_contents("log.txt", "DECODED: " . json_encode($data) . "\n", FILE_APPEND);

if (
    !empty($data->name) &&
    !empty($data->phone) &&
    !empty($data->id_number) &&
    !empty($data->service) &&
    !empty($data->service_type) &&
    !empty($data->comment) &&
    !empty($data->serialNumber)
) {
    try {
        $checkedDocsJson = isset($data->checked_documents) ? json_encode($data->checked_documents) : null;
        $documentStageJson = isset($data->document_stage) ? json_encode($data->document_stage) : null;
        $stmt = $pdo->prepare("INSERT INTO client_service_requests
            (name, phone, id_number, service, service_type, comment, serialNumber, checked_documents, document_stage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $data->name,
            $data->phone,
            $data->id_number,
            $data->service,
            $data->service_type,
            $data->comment,
            $data->serialNumber,
            $checkedDocsJson,
            $documentStageJson
        ]);
        echo json_encode(["success" => $success]);
    } catch (PDOException $e) {
        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
}
