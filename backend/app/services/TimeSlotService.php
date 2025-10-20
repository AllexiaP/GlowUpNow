<?php
namespace App\services;

use App\models\Service;

class TimeSlotService {
    public static function computeEndTime(int $serviceId, string $startTime): string {
        $service = Service::findById($serviceId);
        $duration = (int)($service['duration_minutes'] ?? 0);
        if ($duration <= 0) { $duration = 60; }
        $start = strtotime($startTime);
        return date('H:i:s', $start + ($duration * 60));
    }

    public static function isWithinWorkingHours(int $staffId, string $date, string $start, string $end): bool {
        // TODO: Implement using working_hours table; temporary rule 09:00-18:00
        $min = strtotime('09:00:00');
        $max = strtotime('18:00:00');
        $s = strtotime($start);
        $e = strtotime($end);
        return $s >= $min && $e <= $max && $e > $s;
    }
}
