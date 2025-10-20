<?php
// Booking model — Data access for bookings with joins to services and users.
namespace App\models;

use App\core\Database;use PDO;use PDOException;use RuntimeException;

class Booking {
    public static function list(array $filters = []): array {
        $pdo = Database::pdo();
        $sql = "SELECT b.id, b.user_id, b.service_id, b.date, b.start_time, b.end_time, b.status, b.notes, b.created_at,
                       s.name AS service_name, s.price, u.name AS customer_name
                FROM bookings b
                INNER JOIN services s ON s.id = b.service_id
                INNER JOIN users u ON u.id = b.user_id
                WHERE 1";
        $params = [];
        if (!empty($filters['status'])) { $sql .= " AND b.status = :status"; $params[':status'] = $filters['status']; }
        if (!empty($filters['service_id'])) { $sql .= " AND b.service_id = :sid"; $params[':sid'] = (int)$filters['service_id']; }
        if (!empty($filters['user_id'])) { $sql .= " AND b.user_id = :uid"; $params[':uid'] = (int)$filters['user_id']; }
        if (!empty($filters['from'])) { $sql .= " AND b.date >= :from"; $params[':from'] = $filters['from']; }
        if (!empty($filters['to'])) { $sql .= " AND b.date <= :to"; $params[':to'] = $filters['to']; }
        $sql .= " ORDER BY b.date DESC, b.start_time DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function create(array $data): int {
        $pdo = Database::pdo();
        try {
            $pdo->beginTransaction();
            // No-staff mode: lock overlapping bookings for the same date/time window
            $lock = $pdo->prepare("SELECT id FROM bookings WHERE date = :date AND (
                    (start_time < :end_time AND end_time > :start_time)
                ) FOR UPDATE");
            $lock->execute([
                ':date' => $data['date'],
                ':start_time' => $data['start_time'],
                ':end_time' => $data['end_time'],
            ]);
            if ($lock->fetch()) { throw new RuntimeException('Slot taken'); }

            $stmt = $pdo->prepare("INSERT INTO bookings (user_id, service_id, date, start_time, end_time, status, notes, created_at)
                                   VALUES (:user_id,:service_id,:date,:start_time,:end_time,:status,:notes,NOW())");
            $stmt->execute([
                ':user_id' => $data['user_id'],
                ':service_id' => $data['service_id'],
                ':date' => $data['date'],
                ':start_time' => $data['start_time'],
                ':end_time' => $data['end_time'],
                ':status' => $data['status'] ?? 'pending',
                ':notes' => $data['notes'] ?? '',
            ]);
            $id = (int)$pdo->lastInsertId();
            $pdo->commit();
            return $id;
        } catch (RuntimeException $e) {
            $pdo->rollBack();
            throw $e;
        } catch (PDOException $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function update(int $id, array $data): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("UPDATE bookings SET notes=:notes WHERE id=:id");
        return $stmt->execute([':notes'=>$data['notes'] ?? '', ':id'=>$id]);
    }

    public static function updateStatus(int $id, string $newStatus): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("UPDATE bookings SET status=:status WHERE id=:id");
        return $stmt->execute([':status'=>$newStatus, ':id'=>$id]);
    }

    public static function delete(int $id): bool {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("DELETE FROM bookings WHERE id=:id");
        return $stmt->execute([':id'=>$id]);
    }
}
