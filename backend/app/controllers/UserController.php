<?php
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\models\User;

class UserController extends Controller {
    public function index(Request $req, Response $res): void {
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) { $res->json(['error'=>'Unauthorized'],401); return; }
        $user = User::findById((int)$uid);
        $res->json(['user'=>User::publicUser($user)]);
    }

    public function update(Request $req, Response $res): void {
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) { $res->json(['error'=>'Unauthorized'],401); return; }
        $data = $req->body();
        $name = trim($data['name'] ?? '');
        if ($name==='') { $res->json(['errors'=>['name'=>'Name required']],422); return; }
        $ok = User::updateProfile((int)$uid, ['name'=>$name,'phone'=>$data['phone'] ?? null]);
        $res->json(['updated'=>$ok]);
    }
}
