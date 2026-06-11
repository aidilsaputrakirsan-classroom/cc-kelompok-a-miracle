"""
Unit tests — error rate alerting di MetricsCollector (item-service).

Verifikasi:
- Error rate > 10% dalam sliding window 1 menit → log CRITICAL + alert: true
- Error rate ≤ 10% → tidak ada alert
- Kurang dari ALERT_MIN_REQUESTS → tidak ada alert
- Cooldown mencegah alert spam
- Alert kembali aktif setelah cooldown habis
- Requests lama (> 60s) dikeluarkan dari window
- Semua field wajib ada di log entry
"""
import time
from unittest.mock import patch

import pytest

import metrics as metrics_module
from metrics import (
    MetricsCollector,
    ALERT_ERROR_RATE_THRESHOLD,
    ALERT_MIN_REQUESTS,
    ALERT_COOLDOWN_SECONDS,
    ALERT_WINDOW_SECONDS,
)


def _record(collector, n_ok, n_err):
    """Helper: catat n_ok request sukses dan n_err request error."""
    for _ in range(n_ok):
        collector.record_request("GET", "/test", 200, 5.0)
    for _ in range(n_err):
        collector.record_request("GET", "/test", 500, 5.0)


class TestNoAlert:
    def test_error_rate_exactly_at_threshold_no_alert(self):
        """Error rate tepat 10% (bukan > 10%) tidak boleh trigger alert."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 9, 1)  # 10.0% — threshold adalah > 10%
            mock_log.critical.assert_not_called()

    def test_too_few_requests_no_alert(self):
        """Kurang dari ALERT_MIN_REQUESTS request tidak trigger alert meski semua error."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 0, ALERT_MIN_REQUESTS - 1)
            mock_log.critical.assert_not_called()

    def test_zero_errors_no_alert(self):
        """Tidak ada error sama sekali tidak trigger alert."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 20, 0)
            mock_log.critical.assert_not_called()


class TestAlertTriggered:
    def test_alert_fires_when_error_rate_above_threshold(self):
        """Error rate > 10% memicu log CRITICAL."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 8, 2)  # 20% > 10%
            mock_log.critical.assert_called_once()

    def test_alert_fires_at_minimum_viable_rate(self):
        """5 request dengan 2 error (40%) melebihi threshold."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 3, 2)  # 5 total, 40%
            mock_log.critical.assert_called_once()

    def test_alert_log_fields_complete(self):
        """Log CRITICAL harus mengandung semua field yang diperlukan."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 8, 2)

            extra = mock_log.critical.call_args.kwargs.get("extra", {})
            assert extra.get("alert") is True
            assert extra.get("error_rate_percent") > ALERT_ERROR_RATE_THRESHOLD
            assert extra.get("window_requests") >= ALERT_MIN_REQUESTS
            assert extra.get("window_errors") >= 1
            assert extra.get("window_seconds") == ALERT_WINDOW_SECONDS

    def test_alert_message_contains_error_rate(self):
        """Pesan log CRITICAL menyebutkan error rate."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 8, 2)
            message = mock_log.critical.call_args.args[0]
            assert "error rate" in message.lower() or "%" in message


class TestCooldown:
    def test_second_alert_suppressed_within_cooldown(self):
        """Alert kedua dalam periode cooldown tidak boleh dikirim."""
        mc = MetricsCollector()
        with patch.object(metrics_module, "logger") as mock_log:
            _record(mc, 8, 2)
            assert mock_log.critical.call_count == 1

            _record(mc, 0, 10)
            assert mock_log.critical.call_count == 1

    def test_alert_fires_again_after_cooldown_expires(self):
        """Alert kembali aktif setelah cooldown habis."""
        mc = MetricsCollector()
        base = time.time()

        with patch.object(metrics_module, "logger") as mock_log:
            with patch("metrics.time") as mock_time:
                mock_time.time.return_value = base
                _record(mc, 8, 2)
                assert mock_log.critical.call_count == 1

                mock_time.time.return_value = base + ALERT_COOLDOWN_SECONDS + 1
                _record(mc, 8, 2)
                assert mock_log.critical.call_count == 2


class TestSlidingWindow:
    def test_old_requests_excluded_from_window(self):
        """Request lebih lama dari ALERT_WINDOW_SECONDS dibuang dari perhitungan."""
        mc = MetricsCollector()
        base = time.time()

        with patch("metrics.time") as mock_time:
            mock_time.time.return_value = base
            _record(mc, 0, 2)

            mock_time.time.return_value = base + ALERT_WINDOW_SECONDS + 1
            _record(mc, 5, 0)

            result = mc.get_metrics()
            assert result["last_minute"]["requests"] == 5
            assert result["last_minute"]["error_rate_percent"] == 0.0

    def test_window_count_reflects_only_recent_requests(self):
        """get_metrics mengembalikan hitung request dalam window yang akurat."""
        mc = MetricsCollector()
        base = time.time()

        with patch("metrics.time") as mock_time:
            mock_time.time.return_value = base
            _record(mc, 10, 0)

            mock_time.time.return_value = base + ALERT_WINDOW_SECONDS + 5
            _record(mc, 3, 0)

            result = mc.get_metrics()
            assert result["last_minute"]["requests"] == 3

    def test_alert_threshold_reported_in_metrics(self):
        """get_metrics menyertakan nilai threshold untuk keperluan monitoring."""
        mc = MetricsCollector()
        result = mc.get_metrics()
        assert result["last_minute"]["alert_threshold_percent"] == ALERT_ERROR_RATE_THRESHOLD
