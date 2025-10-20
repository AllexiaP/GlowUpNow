<?php
// AdminUserController — Admin-only user listing with search and pagination (read-only).
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\core\Database;

class AdminUserController extends Controller {
    public function index(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $q = trim($req->query()['q'] ?? '');
        $page = max(1, (int)($req->query()['page'] ?? 1));
        $perPage = min(100, max(5, (int)($req->query()['perPage'] ?? ($req->query()['per_page'] ?? 20))));
        $offset = ($page - 1) * $perPage;

        $where = [];
        $params = [];
        if ($q !== ''){
            $where[] = '(name LIKE :q OR email LIKE :q OR role LIKE :q)';
            $params[':q'] = '%'.$q.'%';
        }
        $whereSql = $where ? ('WHERE '.implode(' AND ', $where)) : '';

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users $whereSql");
        $stmt->execute($params);
        $total = (int)$stmt->fetchColumn();

        $sql = "SELECT id, name, email, role, phone, created_at
                FROM users $whereSql
                ORDER BY created_at DESC, id DESC
                LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($params as $k=>$v){ $stmt->bindValue($k, $v); }
        $stmt->bindValue(':limit', $perPage, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();

        $res->json([
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'rows' => $rows,
        ]);
    }
}
