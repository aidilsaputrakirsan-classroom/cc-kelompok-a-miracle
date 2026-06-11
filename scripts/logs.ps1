# ================================================
# Log Helper Script — Tracelt (Windows PowerShell)
# Usage: .\scripts\logs.ps1 [all|errors|trace|metrics]
# ================================================

param(
    [string]$Command = "all",
    [string]$TraceId = ""
)

Write-Host "=== Tracelt Log Helper ===" -ForegroundColor Cyan

switch ($Command) {
    "all" {
        Write-Host "📋 Menampilkan semua logs (auth + item)..." -ForegroundColor Green
        docker compose logs -f auth-service item-service
    }
    "errors" {
        Write-Host "❌ Menampilkan ERROR logs saja..." -ForegroundColor Red
        docker compose logs auth-service item-service 2>&1 | Select-String '"level":"ERROR"' 
    }
    "trace" {
        if ([string]::IsNullOrEmpty($TraceId)) {
            Write-Host "Usage: .\scripts\logs.ps1 trace <correlation-id>" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "🔗 Melacak Correlation ID: $TraceId" -ForegroundColor Magenta
        docker compose logs auth-service item-service 2>&1 | Select-String $TraceId
    }
    "metrics" {
        Write-Host "📊 Mengambil Metrics..." -ForegroundColor Cyan
        
        Write-Host "`n--- Auth Service Metrics ---" -ForegroundColor Green
        try {
            Invoke-WebRequest -Uri "http://localhost/auth/metrics" | 
            Select-Object -ExpandProperty Content | 
            ConvertFrom-Json | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "Gagal mengambil auth metrics" -ForegroundColor Red
        }

        Write-Host "`n--- Item Service Metrics ---" -ForegroundColor Green
        try {
            Invoke-WebRequest -Uri "http://localhost/items/metrics" | 
            Select-Object -ExpandProperty Content | 
            ConvertFrom-Json | ConvertTo-Json -Depth 5
        } catch {
            Write-Host "Gagal mengambil item metrics" -ForegroundColor Red
        }
    }
    default {
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  .\scripts\logs.ps1 all" 
        Write-Host "  .\scripts\logs.ps1 errors"
        Write-Host "  .\scripts\logs.ps1 trace <correlation-id>"
        Write-Host "  .\scripts\logs.ps1 metrics"
    }
}