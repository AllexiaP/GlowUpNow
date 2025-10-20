<?php
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\models\User;

class AuthController extends Controller {
    public function register(Request $req, Response $res): void {
        $data = $req->body();
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        $errors = [];
        if ($name === '') $errors['name'] = 'Name is required';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Invalid email';
        if (strlen($password) < 6) $errors['password'] = 'Password must be at least 6 characters';
        if ($errors) { $res->json(['errors'=>$errors],422); return; }

        if (User::findByEmail($email)) { $res->json(['errors'=>['email'=>'Email already in use']],422); return; }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $userId = User::create([ 'name'=>$name, 'email'=>$email, 'password_hash'=>$hash, 'role'=>'customer' ]);
        if (!$userId) { $res->json(['error'=>'Registration failed'],500); return; }

        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = 'customer';
        $res->json(['message'=>'Registered','user'=>User::findById($userId)],201);
    }

    public function login(Request $req, Response $res): void {
        $data = $req->body();
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password==='') { $res->json(['error'=>'Invalid credentials'],401); return; }
        $user = User::findByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) { $res->json(['error'=>'Invalid credentials'],401); return; }
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['role'] = $user['role'];
        $res->json(['message'=>'Logged in','user'=>User::publicUser($user)],200);
    }

    public function logout(Request $req, Response $res): void {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        $res->json(['message'=>'Logged out']);
    }

    public function me(Request $req, Response $res): void {
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) { $res->json(['user'=>null],200); return; }
        $user = User::findById((int)$uid);
        $res->json(['user'=>User::publicUser($user)]);
    }
}
