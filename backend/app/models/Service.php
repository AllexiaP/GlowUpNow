<?php
// Service model — Data access for services (CRUD) and related queries.
namespace App\models;

use App\core\Database;use PDO;

class Service {
    public static function list(string $q = '', $active = null, string $sort='created_at', string $order='DESC'): array {
        $pdo = Database::pdo();
        $allowedSort = ['created_at','price','name'];
        if (!in_array($sort,$allowedSort,true)) $sort='created_at';
        $sql = "SELECT id,name,category,description,price,duration_minutes,image_path,is_featured,active,created_at FROM services WHERE 1";
        $params = [];
        if ($q !== '') {
            $sql .= " AND (name LIKE :q1 OR description LIKE :q2)";
            $params[':q1'] = '%'.$q.'%';
            $params[':q2'] = '%'.$q.'%';
        }
        if ($active !== null && $active !== '') { $sql .= " AND active = :active"; $params[':active'] = (int)$active; }
        $sql .= " ORDER BY {$sort} {$order}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    public static function create(array $data): int {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("INSERT INTO services (name,category,description,price,duration_minutes,image_path,is_featured,active,created_at) VALUES (:name,:category,:description,:price,:duration,:image_path,:is_featured,1,NOW())");
        $stmt->execute([
            ':name'=>$data['name'],
            ':category'=>$data['category'] ?? null,
            ':description'=>$data['description'] ?? '',
            ':price'=>$data['price'],
            ':duration'=>$data['duration_minutes'],
            ':image_path'=>$data['image_path'] ?? null,
            ':is_featured'=>(int)($data['is_featured'] ?? 0)
        ]);
        return (int)$pdo->lastInsertId();
    }
    public static function update(int $id, array $data): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("UPDATE services SET name=:name, category=:category, description=:description, price=:price, duration_minutes=:duration, image_path=:image_path, is_featured=:is_featured, active=:active WHERE id=:id");
        return $stmt->execute([
            ':name'=>$data['name'],
            ':category'=>$data['category'] ?? null,
            ':description'=>$data['description'] ?? '',
            ':price'=>(float)($data['price'] ?? 0),
            ':duration'=>(int)($data['duration_minutes'] ?? 0),
            ':image_path'=>$data['image_path'] ?? null,
            ':is_featured'=>(int)($data['is_featured'] ?? 0),
            ':active'=>(int)($data['active'] ?? 1),
            ':id'=>$id
        ]);
    }
    public static function delete(int $id): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("DELETE FROM services WHERE id=:id");
        return $stmt->execute([':id'=>$id]);
    }
    public static function findById(int $id): ?array {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("SELECT id,name,category,description,price,duration_minutes,image_path,is_featured,active,created_at FROM services WHERE id=:id LIMIT 1");
        $stmt->execute([':id'=>$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
