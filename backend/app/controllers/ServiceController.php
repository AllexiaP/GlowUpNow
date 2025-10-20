<?php
// ServiceController — Public service listing and admin create/update/delete with image uploads.
namespace App\controllers;

use App\core\Controller;
use App\core\Request;
use App\core\Response;
use App\models\Service;

class ServiceController extends Controller {
    public function index(Request $req, Response $res): void {
        $q = trim($req->query()['q'] ?? '');
        $active = $req->query()['active'] ?? null;
        $sort = $req->query()['sort'] ?? 'created_at';
        $order = strtoupper($req->query()['order'] ?? 'DESC');
        if (!in_array($order, ['ASC','DESC'], true)) { $order = 'DESC'; }
        $services = Service::list($q, $active, $sort, $order);
        $res->json(['data'=>$services]);
    }

    public function store(Request $req, Response $res): void {
        // Accept both JSON and multipart/form-data
        $data = $req->body();
        $id = (int)($data['id'] ?? 0);
        $name = trim($data['name'] ?? '');
        // Defaults: price and duration have sensible fallbacks
        $price = isset($data['price']) ? (float)$data['price'] : 500.0;
        if ($price <= 0) { $price = 500.0; }
        $duration = isset($data['duration_minutes']) ? (int)$data['duration_minutes'] : 60;
        if ($duration <= 0) { $duration = 60; }
        $desc = trim($data['description'] ?? '');
        $category = trim($data['category'] ?? '');
        $imagePath = trim($data['image_path'] ?? '');
        $isFeatured = (int)($data['is_featured'] ?? 0);

        // Handle uploaded file if present
        if (!empty($_FILES['image']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
            $root = dirname(__DIR__, 2);
            $uploadDir = $root . '/public/uploads/services';
            if (!is_dir($uploadDir)) { @mkdir($uploadDir, 0775, true); }
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION) ?: 'jpg';
            $safe = preg_replace('/[^a-zA-Z0-9_-]/','', strtolower(pathinfo($_FILES['image']['name'], PATHINFO_FILENAME)));
            if ($safe==='') { $safe = 'service'; }
            $filename = $safe . '-' . time() . '.' . $ext;
            $dest = $uploadDir . '/' . $filename;
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
                $res->json(['error'=>'Failed to upload image'], 500); return;
            }
            // Public path exposed via backend/public base
            $imagePath = '/uploads/services/' . $filename;
        }

        $errors = [];
        if ($name==='') $errors['name']='Name required';
        if ($price<=0) $errors['price']='Price must be positive';
        if ($duration<=0) $errors['duration_minutes']='Duration must be positive';
        if ($errors) { $res->json(['errors'=>$errors],422); return; }

        if ($id > 0) {
            $current = Service::findById($id);
            if (!$current) { $res->json(['error'=>'Not found'],404); return; }
            // Preserve current image if none provided
            if ($imagePath === '') { $imagePath = $current['image_path'] ?? null; }
            $ok = Service::update($id, [
                'name'=>$name,
                'category'=>$category ?: null,
                'description'=>$desc,
                'price'=>$price,
                'duration_minutes'=>$duration,
                'image_path'=>$imagePath,
                'is_featured'=>$isFeatured,
                'active'=>$data['active'] ?? $current['active'] ?? 1,
            ]);
            if (!$ok) { $res->json(['error'=>'Update failed'],500); return; }
            $res->json(['message'=>'Updated','id'=>$id]);
            return;
        }

        $newId = Service::create([
            'name'=>$name,
            'category'=>$category ?: null,
            'description'=>$desc,
            'price'=>$price,
            'duration_minutes'=>$duration,
            'image_path'=>$imagePath ?: null,
            'is_featured'=>$isFeatured
        ]);
        $res->json(['message'=>'Created','id'=>$newId],201);
    }

    public function update(Request $req, Response $res): void {
        $data = $req->body();
        $id = (int)($data['id'] ?? 0);
        if ($id<=0) { $res->json(['error'=>'Invalid id'],400); return; }
        $ok = Service::update($id, $data);
        if (!$ok) { $res->json(['error'=>'Update failed'],500); return; }
        $res->json(['message'=>'Updated']);
    }

    public function destroy(Request $req, Response $res): void {
        $id = (int)($req->query()['id'] ?? ($req->body()['id'] ?? 0));
        if ($id<=0) { $res->json(['error'=>'Invalid id'],400); return; }
        $ok = Service::delete($id);
        $res->json(['deleted'=>$ok]);
    }
}
