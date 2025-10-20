<?php
// routes/api.php — Defines API routes, middlewares, and handlers (auth, services, bookings, analytics, SSE).
use App\core\{Request, Response};
use App\middlewares\CorsMiddleware;
use App\middlewares\AuthMiddleware;
use App\middlewares\AdminMiddleware;
use App\controllers\{AuthController, ServiceController, BookingController, UserController, DashboardController, StreamController, AdminUserController};

$cors = new CorsMiddleware();
$auth = new AuthMiddleware();
$admin = new AdminMiddleware();

$router->add('GET', '/api/health', function(Request $req, Response $res){
    $res->json(['status'=>'ok','time'=>date('c')]);
}, [$cors]);

// Auth
$router->add('POST', '/api/auth/register', [new AuthController,'register'], [$cors]);
$router->add('POST', '/api/auth/login', [new AuthController,'login'], [$cors]);
$router->add('POST', '/api/auth/logout', [new AuthController,'logout'], [$cors]);
$router->add('GET',  '/api/auth/me', [new AuthController,'me'], [$cors, $auth]);

// Services
$router->add('GET', '/api/services', [new ServiceController,'index'], [$cors]);
$router->add('POST','/api/services', [new ServiceController,'store'], [$cors, $auth, $admin]);
$router->add('PUT', '/api/services', [new ServiceController,'update'], [$cors, $auth, $admin]);
$router->add('DELETE','/api/services', [new ServiceController,'destroy'], [$cors, $auth, $admin]);

// Bookings
$router->add('GET', '/api/bookings', [new BookingController,'index'], [$cors, $auth]);
$router->add('POST','/api/bookings', [new BookingController,'store'], [$cors, $auth]);
$router->add('PUT', '/api/bookings', [new BookingController,'update'], [$cors, $auth]);
$router->add('PATCH','/api/bookings/status', [new BookingController,'updateStatus'], [$cors, $auth, $admin]);
$router->add('DELETE','/api/bookings', [new BookingController,'destroy'], [$cors, $auth]);

// Users
$router->add('GET','/api/users', [new UserController,'index'], [$cors, $auth]);
$router->add('PUT','/api/users', [new UserController,'update'], [$cors, $auth]);
// Admin users
$router->add('GET','/api/admin/users', [new AdminUserController,'index'], [$cors, $auth, $admin]);

// Dashboard
$router->add('GET','/api/analytics/summary', [new DashboardController,'summary'], [$cors, $auth, $admin]);
$router->add('GET','/api/analytics/services-coverage', [new DashboardController,'serviceCoverage'], [$cors, $auth, $admin]);
$router->add('GET','/api/analytics/bookings', [new DashboardController,'bookingsList'], [$cors, $auth, $admin]);
$router->add('GET','/api/analytics/bookings.csv', [new DashboardController,'bookingsCsv'], [$cors, $auth, $admin]);
$router->add('GET','/api/analytics/right-join-demo', [new DashboardController,'rightJoinDemo'], [$cors, $auth, $admin]);

// SSE streams
$router->add('GET','/api/stream/bookings', [new StreamController,'bookings'], [$cors]);
