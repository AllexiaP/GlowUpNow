<?php
// Response — Minimal JSON response helper.
namespace App\core;

class Response {
    public function json($data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}
