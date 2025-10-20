<?php
namespace App\middlewares;

use App\core\Request;
use App\core\Response;

class CorsMiddleware {
    public function __invoke(Request $req, Response $res, callable $next): void {
        $origins = $_ENV['CORS_ALLOWED_ORIGINS'] ?? '';
        $allowed = array_filter(array_map('trim', explode(',', $origins)));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Allow any localhost origin (any port) during development
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

        if ($req->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        $next();
    }
}
