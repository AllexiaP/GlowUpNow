<?php
namespace App\core;

class Router {
    private array $routes = [];
    private array $middlewares = [];

    public function add(string $method, string $path, callable $handler, array $mw = []): void {
        $this->routes[strtoupper($method)][$path] = $handler;
        if (!empty($mw)) { $this->middlewares[$method.$path] = $mw; }
    }

    public function dispatch(Request $req, Response $res): void {
        $method = $req->method();
        $path = $req->path();
        $handler = $this->routes[$method][$path] ?? null;
        if (!$handler) { $res->json(['error'=>'Not Found','path'=>$path],404); return; }
        $stack = $this->middlewares[$method.$path] ?? [];
        $next = function() use (&$handler, $req, $res) { call_user_func($handler, $req, $res); };
        while ($mw = array_pop($stack)) {
            $prev = $next;
            $next = function() use ($mw, $req, $res, $prev) { $mw($req, $res, $prev); };
        }
        $next();
    }
}
