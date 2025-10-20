<?php
// Base Controller — Common base for controllers; can hold shared helpers.
namespace App\core;

class Controller {
    protected function json($data, int $status = 200): void {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
}
