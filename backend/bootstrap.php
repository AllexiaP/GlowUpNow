<?php
// Lightweight bootstrap without Composer.

// 1) Simple .env loader
$envFile = __DIR__ . '/.env';
if (is_file($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $val = trim($parts[1]);
            $val = trim($val, "\"' ");
            $_ENV[$key] = $val;
            putenv("{$key}={$val}");
        }
    }
}

// 2) Minimal PSR-4 autoloader for App\ namespace
spl_autoload_register(function(string $class){
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) return;
    $relative = substr($class, strlen($prefix));
    $path = __DIR__ . '/app/' . str_replace('\\', '/', $relative) . '.php';
    if (is_file($path)) require $path;
});

// 3) Error reporting
$debug = ($_ENV['APP_DEBUG'] ?? 'false') === 'true';
ini_set('display_errors', $debug ? '1' : '0');
ini_set('display_startup_errors', $debug ? '1' : '0');
error_reporting($debug ? E_ALL : 0);

// 4) Timezone & session
date_default_timezone_set('Asia/Manila');
session_name($_ENV['SESSION_NAME'] ?? 'GLOWUPSESSID');
if (session_status() === PHP_SESSION_NONE) session_start();
