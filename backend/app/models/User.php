<?php
// User model — Data access for users (auth, profile) and helpers.
namespace App\models;

use App\core\Database;use PDO;

class User {
    public static function create(array $data): ?int {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("INSERT INTO users (name,email,password_hash,role,phone,created_at) VALUES (:name,:email,:password_hash,:role,:phone,NOW())");
        $ok = $stmt->execute([
            ':name'=>$data['name'],
            ':email'=>$data['email'],
            ':password_hash'=>$data['password_hash'],
            ':role'=>$data['role'] ?? 'customer',
            ':phone'=>$data['phone'] ?? null,
        ]);
        return $ok ? (int)$pdo->lastInsertId() : null;
    }
    public static function findByEmail(string $email): ?array {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email'=>$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
    public static function findById(int $id): ?array {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id=:id");
        $stmt->execute([':id'=>$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
    public static function publicUser(?array $user): ?array {
        if (!$user) return null;
        return [
            'id'=>(int)$user['id'],
            'name'=>$user['name'],
            'email'=>$user['email'],
            'role'=>$user['role'],
            'phone'=>$user['phone'] ?? null,
            'created_at'=>$user['created_at'] ?? null,
        ];
    }
    public static function updateProfile(int $id, array $data): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("UPDATE users SET name=:name, phone=:phone WHERE id=:id");
        return $stmt->execute([':name'=>$data['name'], ':phone'=>$data['phone'] ?? null, ':id'=>$id]);
    }
}
