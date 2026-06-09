"""
Simple In-Memory Metrics Collector.
Mengumpulkan metrics dasar: request count, error count, latency.
Dilengkapi error rate alerting dengan sliding window 1 menit (Modul 14).
"""
import logging
import time
import threading
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

# Alert thresholds
ALERT_ERROR_RATE_THRESHOLD = 10.0   # persen — alert jika error rate > 10%
ALERT_WINDOW_SECONDS = 60           # window 1 menit terakhir
ALERT_MIN_REQUESTS = 5              # minimal request dalam window agar alert bermakna
ALERT_COOLDOWN_SECONDS = 60         # jeda antar alert agar tidak spam


class MetricsCollector:
    """Thread-safe metrics collector dengan error rate alerting."""

    def __init__(self):
        self._lock = threading.Lock()
        self.start_time = time.time()

        # Counters keseluruhan
        self.request_count = 0
        self.error_count = 0
        self.status_counts = defaultdict(int)

        # Latency tracking (last 1000 requests)
        self.latencies = []
        self.max_latency_samples = 1000

        # Per-endpoint stats
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_latency_ms": 0,
        })

        # Sliding window untuk error rate alerting
        # Setiap entry: (timestamp, is_error)
        self._recent_requests: deque = deque()
        self._last_alert_time: float = 0.0

    def record_request(self, method: str, path: str, status_code: int, duration_ms: float):
        """Catat satu request dan periksa kondisi alert error rate."""
        is_error = status_code >= 400
        alert_info = None

        with self._lock:
            now = time.time()

            # — existing counters —
            self.request_count += 1
            self.status_counts[status_code] += 1
            if is_error:
                self.error_count += 1

            self.latencies.append(duration_ms)
            if len(self.latencies) > self.max_latency_samples:
                self.latencies.pop(0)

            key = f"{method} {path}"
            self.endpoint_stats[key]["count"] += 1
            self.endpoint_stats[key]["total_latency_ms"] += duration_ms
            if is_error:
                self.endpoint_stats[key]["errors"] += 1

            # — sliding window —
            self._recent_requests.append((now, is_error))
            # Hapus entri lebih tua dari ALERT_WINDOW_SECONDS
            cutoff = now - ALERT_WINDOW_SECONDS
            while self._recent_requests and self._recent_requests[0][0] < cutoff:
                self._recent_requests.popleft()

            # — periksa kondisi alert —
            window_count = len(self._recent_requests)
            if window_count >= ALERT_MIN_REQUESTS:
                window_errors = sum(1 for _, err in self._recent_requests if err)
                window_error_rate = window_errors / window_count * 100

                if (window_error_rate > ALERT_ERROR_RATE_THRESHOLD
                        and now - self._last_alert_time >= ALERT_COOLDOWN_SECONDS):
                    self._last_alert_time = now
                    alert_info = {
                        "error_rate_percent": round(window_error_rate, 2),
                        "window_requests": window_count,
                        "window_errors": window_errors,
                        "window_seconds": ALERT_WINDOW_SECONDS,
                    }

        # Log CRITICAL di luar lock untuk menghindari potensi deadlock
        if alert_info:
            logger.critical(
                f"High error rate: {alert_info['error_rate_percent']}% "
                f"({alert_info['window_errors']}/{alert_info['window_requests']} requests "
                f"in last {ALERT_WINDOW_SECONDS}s)",
                extra={
                    "alert": True,
                    **alert_info,
                },
            )

    def get_metrics(self) -> dict:
        """Return snapshot metrics."""
        with self._lock:
            now = time.time()
            uptime = round(now - self.start_time, 1)
            error_rate = (
                round(self.error_count / self.request_count * 100, 2)
                if self.request_count > 0 else 0
            )

            # Latency percentiles
            latency_stats = {}
            if self.latencies:
                sorted_lat = sorted(self.latencies)
                n = len(sorted_lat)
                latency_stats = {
                    "p50_ms": round(sorted_lat[int(n * 0.5)], 2),
                    "p95_ms": round(sorted_lat[int(n * 0.95)], 2),
                    "p99_ms": round(sorted_lat[min(int(n * 0.99), n - 1)], 2),
                    "avg_ms": round(sum(sorted_lat) / n, 2),
                }

            # Sliding window error rate
            cutoff = now - ALERT_WINDOW_SECONDS
            recent = [(ts, err) for ts, err in self._recent_requests if ts >= cutoff]
            recent_count = len(recent)
            recent_error_rate = (
                round(sum(1 for _, err in recent if err) / recent_count * 100, 2)
                if recent_count > 0 else 0
            )

            # Per-endpoint stats
            endpoints = {}
            for key, stats in self.endpoint_stats.items():
                avg_lat = (
                    round(stats["total_latency_ms"] / stats["count"], 2)
                    if stats["count"] > 0 else 0
                )
                endpoints[key] = {
                    "count": stats["count"],
                    "errors": stats["errors"],
                    "avg_latency_ms": avg_lat,
                }

            return {
                "uptime_seconds": uptime,
                "total_requests": self.request_count,
                "total_errors": self.error_count,
                "error_rate_percent": error_rate,
                "last_minute": {
                    "requests": recent_count,
                    "error_rate_percent": recent_error_rate,
                    "alert_threshold_percent": ALERT_ERROR_RATE_THRESHOLD,
                },
                "status_codes": dict(self.status_counts),
                "latency": latency_stats,
                "endpoints": endpoints,
            }

    def reset(self):
        """Reset semua metrics."""
        with self._lock:
            self.request_count = 0
            self.error_count = 0
            self.status_counts.clear()
            self.latencies.clear()
            self.endpoint_stats.clear()
            self._recent_requests.clear()
            self._last_alert_time = 0.0


# Singleton instance
metrics = MetricsCollector()
