<?php
namespace App\middlewares;

use App\core\Request;
use App\core\Response;

class AuthMiddleware {
    public function __invoke(Request $req, Response $res, callable $next): void {
        if (!isset($_SESSION['user_id'])) {
            $res->json(['error' => 'Unauthorized'], 401);
            return;
        }
        $next();
    }
}
