<?php
// Database — PDO connection singleton/factory for database access.
namespace App\core;

use PDO;use PDOException;use RuntimeException;

class Database {
    private static ?PDO $pdo = null;

    public static function pdo(): PDO {
        if (self::$pdo === null) {
            $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
            $port = (int)($_ENV['DB_PORT'] ?? 3306);
            $db   = $_ENV['DB_DATABASE'] ?? 'glowupnow';
            $user = $_ENV['DB_USERNAME'] ?? 'root';
            $pass = $_ENV['DB_PASSWORD'] ?? '';
            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
            try {
                self::$pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                throw new RuntimeException('DB connection failed: ' . $e->getMessage());
            }
        }
        return self::$pdo;
    }
}
