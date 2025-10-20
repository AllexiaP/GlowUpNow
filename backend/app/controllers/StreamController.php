<?php
// StreamController — Server-Sent Events (SSE) stream for lightweight real-time pings.
namespace App\controllers;

use App\core\Request;
use App\core\Response;

class StreamController {
    public function bookings(Request $req, Response $res): void {
        // SSE headers
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');

        // Ensure output buffering does not interfere
        if (function_exists('apache_setenv')) { @apache_setenv('no-gzip', '1'); }
        @ini_set('zlib.output_compression', '0');
        @ini_set('implicit_flush', '1');
        while (ob_get_level() > 0) { @ob_end_flush(); }
        @ob_implicit_flush(1);

        // Simple heartbeat loop; real events could be pushed on changes
        $start = time();
        $maxSeconds = 300; // 5 minutes per connection
        echo ": connected\n\n"; // comment to open the stream
        flush();
        while (true) {
            if (connection_aborted()) { break; }
            $elapsed = time() - $start;
            if ($elapsed > $maxSeconds) { break; }
            echo "event: ping\n";
            echo "data: {}\n\n";
            flush();
            // 25s between pings
            sleep(25);
        }
        // graceful end
        echo "event: end\n";
        echo "data: {}\n\n";
        flush();
    }
}
