# ================================================
# Log Helper Script — Tracelt (Modul 14.5)
# Usage: .\scripts\logs.ps1 [all|errors|trace|metrics]
# ================================================

param(
    [string]$Command = "all",
    [string]$TraceId = ""
)

Write-Host "=== Tracelt Log Helper (Modul 14.5) ===" -ForegroundColor Cyan

switch ($Command.ToLower()) {
    "all" {
        Write-Host "Showing all logs..." -ForegroundColor Green
        docker compose logs -f auth-service item-service gateway
    }
    "errors" {
        Write-Host "Showing ERROR/CRITICAL logs only..." -ForegroundColor Red
        docker compose logs auth-service item-service 2>&1 | Select-String '"level"\s*:\s*"(ERROR|CRITICAL)"' -ErrorAction SilentlyContinue
    }
    "trace" {
        if ([string]::IsNullOrEmpty($TraceId)) {
            Write-Host "Usage: .\scripts\logs.ps1 trace <correlation-id>" -ForegroundColor Yellow
            Write-Host "Example: .\scripts\logs.ps1 trace bf1df576" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Tracing Correlation ID: $TraceId" -ForegroundColor Magenta
        docker compose logs auth-service item-service 2>&1 | Select-String $TraceId -ErrorAction SilentlyContinue
    }
    "metrics" {
        Write-Host "Fetching Metrics..." -ForegroundColor Cyan
        
        try {
            Write-Host "`n--- Auth Service Metrics ---" -ForegroundColor Green
            Invoke-WebRequest -Uri "http://localhost/auth/metrics" -UseBasicParsing -ErrorAction Stop | 
            Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 4
        } catch {
            Write-Host "Failed to get Auth Metrics" -ForegroundColor Red
        }

        try {
            Write-Host "`n--- Donor Service Metrics ---" -ForegroundColor Green
            Invoke-WebRequest -Uri "http://localhost/donor/metrics" -UseBasicParsing -ErrorAction Stop |
            Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 4
        } catch {
            Write-Host "Failed to get Donor Metrics" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\scripts\logs.ps1 all"
        Write-Host "  .\scripts\logs.ps1 errors"
        Write-Host "  .\scripts\logs.ps1 trace <id>"
        Write-Host "  .\scripts\logs.ps1 metrics"
    }
}
