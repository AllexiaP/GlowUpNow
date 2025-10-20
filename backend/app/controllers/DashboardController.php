<?php
// DashboardController — Admin analytics endpoints: summary, service coverage, bookings list and CSV.
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\core\Database;

class DashboardController extends Controller {
    public function summary(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $from = $req->query()['from'] ?? date('Y-m-01');
        $to   = $req->query()['to']   ?? date('Y-m-t');

        $stmt = $pdo->prepare("SELECT COUNT(*) cnt FROM bookings WHERE date BETWEEN :from AND :to");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $totalBookings = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT s.name, COUNT(*) cnt
                               FROM bookings b
                               INNER JOIN services s ON s.id=b.service_id
                               WHERE b.date BETWEEN :from AND :to
                               GROUP BY s.id, s.name
                               ORDER BY cnt DESC
                               LIMIT 5");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $topServices = $stmt->fetchAll();

        // status breakdown
        $stmt = $pdo->prepare("SELECT status, COUNT(*) cnt
                               FROM bookings
                               WHERE date BETWEEN :from AND :to
                               GROUP BY status");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $byStatus = $stmt->fetchAll();

        // category breakdown
        $stmt = $pdo->prepare("SELECT COALESCE(NULLIF(s.category,''),'Uncategorized') AS category, COUNT(*) cnt
                               FROM bookings b
                               INNER JOIN services s ON s.id=b.service_id
                               WHERE b.date BETWEEN :from AND :to
                               GROUP BY COALESCE(NULLIF(s.category,''),'Uncategorized')
                               ORDER BY cnt DESC");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $byCategory = $stmt->fetchAll();

        // daily trend within range
        $stmt = $pdo->prepare("SELECT date, COUNT(*) cnt
                               FROM bookings
                               WHERE date BETWEEN :from AND :to
                               GROUP BY date
                               ORDER BY date ASC");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $daily = $stmt->fetchAll();

        // Revenue totals and average duration for services booked in range
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(s.price),0) AS total_rev, COALESCE(AVG(s.duration_minutes),0) AS avg_duration
                               FROM bookings b
                               INNER JOIN services s ON s.id=b.service_id
                               WHERE b.date BETWEEN :from AND :to");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $row = $stmt->fetch();
        $totalRevenue = (float)($row['total_rev'] ?? 0);
        $avgDuration  = (float)($row['avg_duration'] ?? 0);
        $days = max(1, (int)((strtotime($to) - strtotime($from)) / 86400) + 1);
        $avgPerDay = $totalRevenue / $days;

        // Revenue by category (no HAVING filter)
        $stmt = $pdo->prepare("SELECT COALESCE(NULLIF(s.category,''),'Uncategorized') AS category, COALESCE(SUM(s.price),0) AS total_rev
                               FROM bookings b
                               INNER JOIN services s ON s.id=b.service_id
                               WHERE b.date BETWEEN :from AND :to
                               GROUP BY COALESCE(NULLIF(s.category,''),'Uncategorized')
                               ORDER BY total_rev DESC");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $revByCategory = $stmt->fetchAll();

        $res->json([
            'range' => ['from'=>$from,'to'=>$to],
            'totals' => ['bookings'=>$totalBookings],
            'top_services' => $topServices,
            'by_status' => $byStatus,
            'by_category' => $byCategory,
            'daily' => $daily,
            'revenue' => [
                'total' => $totalRevenue,
                'avg_per_day' => $avgPerDay,
                'avg_duration_minutes' => $avgDuration,
            ],
            'revenue_by_category' => $revByCategory,
            'bounds' => [
                'min_date' => $bounds['min_date'] ?? null,
                'max_date' => $bounds['max_date'] ?? null,
            ],
        ]);
    }

    public function bookingsCsv(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $q = $req->query()['q'] ?? '';
        $status = $req->query()['status'] ?? '';
        $from = $req->query()['from'] ?? date('Y-m-01');
        $to   = $req->query()['to']   ?? date('Y-m-t');

        $where = ["b.date BETWEEN :from AND :to"];
        $params = [':from'=>$from, ':to'=>$to];
        if ($status !== '') { $where[] = 'b.status = :status'; $params[':status'] = $status; }
        if ($q !== '') {
            $where[] = '(b.id = :idq OR u.name LIKE :uq OR s.name LIKE :sq)';
            $params[':idq'] = ctype_digit($q) ? (int)$q : -1;
            $params[':uq'] = '%'.$q.'%';
            $params[':sq'] = '%'.$q.'%';
        }
        $whereSql = 'WHERE '.implode(' AND ', $where);

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="bookings_'.($from).'_to_'.($to).'.csv"');
        $out = fopen('php://output', 'w');
        fputcsv($out, ['ID','Date','Start','End','Status','Customer','Service','Price','Notes']);
        $stmt = $pdo->prepare("SELECT b.id, b.date, b.start_time, b.end_time, b.status, b.notes,
                                      u.name AS customer_name, s.name AS service_name, s.price
                               FROM bookings b
                               INNER JOIN services s ON s.id=b.service_id
                               INNER JOIN users u ON u.id=b.user_id
                               $whereSql
                               ORDER BY b.date DESC, b.start_time DESC");
        $stmt->execute($params);
        while ($r = $stmt->fetch()) {
            fputcsv($out, [
                $r['id'], $r['date'], $r['start_time'], $r['end_time'], $r['status'],
                $r['customer_name'], $r['service_name'], number_format((float)$r['price'],2,'.',''), $r['notes']
            ]);
        }
        fclose($out);
        exit;
    }

    public function rightJoinDemo(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $from = $req->query()['from'] ?? date('Y-m-01');
        $to   = $req->query()['to']   ?? date('Y-m-t');

        // RIGHT JOIN example (mirrors the LEFT JOIN coverage but uses RIGHT JOIN syntax):
        // Ensures all services appear even if they have zero bookings in the date range.
        $stmt = $pdo->prepare("SELECT s.id, s.name, COALESCE(COUNT(b.id),0) AS bookings
                               FROM bookings b
                               RIGHT JOIN services s
                                 ON s.id = b.service_id
                                AND b.date BETWEEN :from AND :to
                               GROUP BY s.id, s.name
                               ORDER BY bookings DESC, s.name ASC");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $rows = $stmt->fetchAll();

        $res->json([
            'range' => ['from'=>$from,'to'=>$to],
            'services' => $rows,
        ]);
    }

    public function serviceCoverage(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $from = $req->query()['from'] ?? date('Y-m-01');
        $to   = $req->query()['to']   ?? date('Y-m-t');

        // LEFT JOIN: include services with zero bookings in the window
        $stmt = $pdo->prepare("SELECT s.id, s.name, COALESCE(COUNT(b.id),0) AS bookings
                               FROM services s
                               LEFT JOIN bookings b
                                 ON b.service_id = s.id
                                AND b.date BETWEEN :from AND :to
                               GROUP BY s.id, s.name
                               ORDER BY bookings DESC, s.name ASC");
        $stmt->execute([':from'=>$from, ':to'=>$to]);
        $rows = $stmt->fetchAll();

        $res->json([
            'range' => ['from'=>$from,'to'=>$to],
            'services' => $rows,
        ]);
    }

    public function bookingsList(Request $req, Response $res): void {
        $pdo = Database::pdo();
        $q = $req->query()['q'] ?? '';
        $status = $req->query()['status'] ?? '';
        $from = $req->query()['from'] ?? date('Y-m-01');
        $to   = $req->query()['to']   ?? date('Y-m-t');
        $page = max(1, (int)($req->query()['page'] ?? 1));
        $perPage = min(100, max(5, (int)($req->query()['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $where = ["b.date BETWEEN :from AND :to"];
        $params = [':from'=>$from, ':to'=>$to];
        if ($status !== '') { $where[] = 'b.status = :status'; $params[':status'] = $status; }
        if ($q !== '') {
            $where[] = '(b.id = :idq OR u.name LIKE :uq OR s.name LIKE :sq)';
            $params[':idq'] = ctype_digit($q) ? (int)$q : -1;
            $params[':uq'] = '%'.$q.'%';
            $params[':sq'] = '%'.$q.'%';
        }
        $whereSql = 'WHERE '.implode(' AND ', $where);

        $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings b INNER JOIN services s ON s.id=b.service_id INNER JOIN users u ON u.id=b.user_id $whereSql");
        $stmt->execute($params);
        $total = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("SELECT b.id, b.date, b.start_time, b.end_time, b.status, b.notes, b.created_at,
                                      s.name AS service_name, s.price, u.name AS customer_name
                                FROM bookings b
                                INNER JOIN services s ON s.id=b.service_id
                                INNER JOIN users u ON u.id=b.user_id
                                $whereSql
                                ORDER BY b.date DESC, b.start_time DESC
                                LIMIT :limit OFFSET :offset");
        foreach ($params as $k=>$v) { $stmt->bindValue($k, $v); }
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
