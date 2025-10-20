<?php
require __DIR__ . '/../bootstrap.php';

use App\core\{Router, Request, Response};

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = array_filter(array_map('trim', explode(',', $_ENV['CORS_ALLOWED_ORIGINS'] ?? '')));
$isLocalhost = $origin && (
    preg_match('#^http://localhost(?::\d+)?$#', $origin) ||
    preg_match('#^http://127\.0\.0\.1(?::\d+)?$#', $origin)
);
if ($origin && ($isLocalhost || in_array($origin, $allowed, true))) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
// Echo requested headers if provided (preflight), fallback to common defaults
$reqHeaders = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ?? 'Content-Type, Authorization, Accept';
header("Access-Control-Allow-Headers: {$reqHeaders}");
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$router = new Router();
$request = new Request();
$response = new Response();

require __DIR__ . '/../routes/api.php';

$router->dispatch($request, $response);
