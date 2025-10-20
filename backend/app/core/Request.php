<?php
// Request — Encapsulates HTTP request data (query, body, files, headers).
namespace App\core;

class Request {
    public function method(): string { return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET'); }
    public function path(): string {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $script = $_SERVER['SCRIPT_NAME'] ?? '';
        $base = rtrim(str_replace('index.php','',$script),'/');
        $path = parse_url($uri, PHP_URL_PATH) ?? '/';
        if ($base && str_starts_with($path, $base)) { $path = substr($path, strlen($base)); }
        return '/' . ltrim($path,'/');
    }
    public function body(): array {
        $input = file_get_contents('php://input');
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType,'application/json')) {
            $decoded = json_decode($input, true);
            return is_array($decoded) ? $decoded : [];
        }
        return $_POST ?: [];
    }
    public function query(): array { return $_GET ?: []; }
    public function headers(): array { return function_exists('getallheaders') ? (getallheaders() ?: []) : []; }
}
