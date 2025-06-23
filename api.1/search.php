<?php
// Handle preflight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    exit(0);
}

// Response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

// DB connection
include_once "db.php";

// Decode input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["success" => false, "message" => "No JSON received"]);
    exit;
}

$searchTerm = isset($input['query']) ? trim($input['query']) : '';

if ($searchTerm === '__ALL__') {
    // List all records, newest first
    try {
        $stmt = $pdo->query("SELECT id, name, id_number, phone, service, service_type, comment, serialNumber, submitted_at, checked_documents, document_stage FROM client_service_requests ORDER BY id DESC");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($results as &$row) {
            $row['ownerName'] = $row['name'];
            $row['serviceType'] = $row['service_type'];
            $row['comments'] = $row['comment'];
            $row['idNumber'] = $row['id_number'];
            $row['serialNumber'] = $row['serialNumber'];
            $row['submittedAt'] = $row['submitted_at'];
            $row['checked_documents'] = $row['checked_documents'] ? json_decode($row['checked_documents']) : [];
            $row['document_stage'] = $row['document_stage'] ? json_decode($row['document_stage']) : null;
            unset($row['name'], $row['service_type'], $row['comment'], $row['id_number'], $row['submitted_at']);
        }
        echo json_encode(["success" => true, "data" => $results]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($searchTerm === '') {
    echo json_encode(["success" => false, "message" => "No search term provided"]);
    exit;
}

try {
    // If the search term is numeric, do an exact match for id_number
    if (is_numeric($searchTerm)) {
        $stmt = $pdo->prepare("
            SELECT id, name, id_number, phone, service, service_type, comment, serialNumber, submitted_at, checked_documents, document_stage
            FROM client_service_requests
            WHERE id_number = ?
        ");
        $stmt->execute([$searchTerm]);
    } else if (preg_match('/^NTSA-/', $searchTerm)) {
        // If the search term looks like a serial number, do an exact match for serialNumber
        $stmt = $pdo->prepare("
            SELECT id, name, id_number, phone, service, service_type, comment, serialNumber, submitted_at, checked_documents, document_stage
            FROM client_service_requests
            WHERE serialNumber = ?
        ");
        $stmt->execute([$searchTerm]);
    } else {
        $stmt = $pdo->prepare("
            SELECT id, name, id_number, phone, service, service_type, comment, serialNumber, submitted_at, checked_documents, document_stage
            FROM client_service_requests
            WHERE name LIKE ? OR id_number LIKE ? OR serialNumber LIKE ?
        ");
        $likeTerm = "%$searchTerm%";
        $stmt->execute([$likeTerm, $likeTerm, $likeTerm]);
    }
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($results as &$row) {
        $row['ownerName'] = $row['name'];
        $row['serviceType'] = $row['service_type'];
        $row['comments'] = $row['comment'];
        $row['idNumber'] = $row['id_number'];
        $row['serialNumber'] = $row['serialNumber'];
        $row['submittedAt'] = $row['submitted_at'];
        $row['checked_documents'] = $row['checked_documents'] ? json_decode($row['checked_documents']) : [];
        $row['document_stage'] = $row['document_stage'] ? json_decode($row['document_stage']) : null;
        unset($row['name'], $row['service_type'], $row['comment'], $row['id_number'], $row['submitted_at']);
    }

    echo json_encode(["success" => true, "data" => $results]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
