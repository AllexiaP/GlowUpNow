<?php
namespace App\middlewares;

use App\core\Request;
use App\core\Response;

class AdminMiddleware {
    public function __invoke(Request $req, Response $res, callable $next): void {
        if (!(isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'admin')) {
            $res->json(['error' => 'Forbidden'], 403);
            return;
        }
        $next();
    }
}
