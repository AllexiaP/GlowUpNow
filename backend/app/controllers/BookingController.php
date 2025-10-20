<?php
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\models\Booking;
use App\services\TimeSlotService;
use RuntimeException;

class BookingController extends Controller {
    public function index(Request $req, Response $res): void {
        $filters = $req->query();
        $res->json(['data'=>Booking::list($filters)]);
    }

    public function store(Request $req, Response $res): void {
        $data = $req->body();
        $errors = [];
        $userId = (int)($data['user_id'] ?? ($_SESSION['user_id'] ?? 0));
        $serviceId = (int)($data['service_id'] ?? 0);
        $date = $data['date'] ?? '';
        $start = $data['start_time'] ?? '';
        if ($userId<=0) $errors['user_id']='User required';
        if ($serviceId<=0) $errors['service_id']='Service required';
        if (!$date) $errors['date']='Date required';
        if (!$start) $errors['start_time']='Start time required';
        if ($errors) { $res->json(['errors'=>$errors],422); return; }

        $end = TimeSlotService::computeEndTime($serviceId, $start);
        // In no-staff mode, enforce general business hours only.
        if (!TimeSlotService::isWithinWorkingHours(0, $date, $start, $end)) {
            $res->json(['error'=>'Outside working hours'],422); return;
        }
        try {
            $id = Booking::create([
                'user_id'=>$userId,
                'service_id'=>$serviceId,
                'date'=>$date,
                'start_time'=>$start,
                'end_time'=>$end,
                'notes'=>$data['notes'] ?? '',
                'status'=>'pending'
            ]);
            $res->json(['message'=>'Created','id'=>$id],201);
        } catch (RuntimeException $e) {
            if ($e->getMessage()==='Slot taken') { $res->json(['error'=>'Slot taken'],409); return; }
            $res->json(['error'=>'Create failed'],500);
        }
    }

    public function update(Request $req, Response $res): void {
        $data = $req->body();
        $id = (int)($data['id'] ?? 0);
        if ($id<=0) { $res->json(['error'=>'Invalid id'],400); return; }
        $ok = Booking::update($id,$data);
        $res->json(['updated'=>$ok]);
    }

    public function updateStatus(Request $req, Response $res): void {
        $data = $req->body();
        $id = (int)($data['id'] ?? 0);
        $status = $data['status'] ?? '';
        if ($id<=0 || !in_array($status,['pending','confirmed','canceled','completed'],true)) {
            $res->json(['error'=>'Invalid input'],422); return;
        }
        $ok = Booking::updateStatus($id,$status);
        $res->json(['updated'=>$ok]);
    }

    public function destroy(Request $req, Response $res): void {
        $id = (int)($req->query()['id'] ?? ($req->body()['id'] ?? 0));
        if ($id<=0) { $res->json(['error'=>'Invalid id'],400); return; }
        $ok = Booking::delete($id);
        $res->json(['deleted'=>$ok]);
    }
}
