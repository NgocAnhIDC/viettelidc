# KPI TT Cloud - Team Management Script
# Sử dụng: .\manage-teams.ps1 [backup|validate|restore|list]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "validate", "restore", "list", "help")]
    [string]$Action,
    
    [string]$BackupFile = ""
)

$ConfigPath = "api\config\teams.json"
$BackupDir = "api\config\backups"

# Tạo thư mục backup nếu chưa có
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

function Show-Help {
    Write-Host "🏢 KPI TT Cloud - Team Management Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Cách sử dụng:" -ForegroundColor Yellow
    Write-Host "  .\manage-teams.ps1 backup          # Tạo backup file teams.json"
    Write-Host "  .\manage-teams.ps1 validate        # Kiểm tra syntax JSON"
    Write-Host "  .\manage-teams.ps1 restore [file]  # Restore từ backup"
    Write-Host "  .\manage-teams.ps1 list            # Liệt kê tất cả teams"
    Write-Host "  .\manage-teams.ps1 help            # Hiển thị hướng dẫn"
    Write-Host ""
    Write-Host "Ví dụ:" -ForegroundColor Green
    Write-Host "  .\manage-teams.ps1 backup"
    Write-Host "  .\manage-teams.ps1 restore teams_backup_20241217_143022.json"
}

function Backup-Teams {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$BackupDir\teams_backup_$timestamp.json"
    
    try {
        Copy-Item $ConfigPath $backupFile
        Write-Host "✅ Backup thành công: $backupFile" -ForegroundColor Green
        
        # Hiển thị thông tin backup
        $fileInfo = Get-Item $backupFile
        Write-Host "📁 Kích thước: $($fileInfo.Length) bytes" -ForegroundColor Gray
        Write-Host "🕒 Thời gian: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Lỗi khi tạo backup: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-Teams {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return $false
    }
    
    try {
        $content = Get-Content $ConfigPath -Raw
        $json = $content | ConvertFrom-Json
        
        Write-Host "✅ JSON syntax hợp lệ" -ForegroundColor Green
        
        # Kiểm tra cấu trúc
        if ($json.teams) {
            Write-Host "🏢 Tìm thấy $($json.teams.Count) teams" -ForegroundColor Cyan
            
            # Kiểm tra Team 14 (Management)
            $managementTeam = $json.teams | Where-Object { $_.team_code -eq "T14" }
            if ($managementTeam) {
                Write-Host "🔐 Team 14 (Management) tồn tại" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Cảnh báo: Không tìm thấy Team 14 (Management)" -ForegroundColor Yellow
            }
            
            # Kiểm tra duplicate IDs
            $duplicateIds = $json.teams | Group-Object id | Where-Object { $_.Count -gt 1 }
            if ($duplicateIds) {
                Write-Host "❌ Phát hiện ID trùng lặp: $($duplicateIds.Name -join ', ')" -ForegroundColor Red
                return $false
            }
            
            # Kiểm tra required fields
            $invalidTeams = $json.teams | Where-Object { 
                !$_.id -or !$_.team_code -or !$_.team_name -or !$_.layer
            }
            if ($invalidTeams) {
                Write-Host "❌ Phát hiện teams thiếu thông tin bắt buộc" -ForegroundColor Red
                return $false
            }
            
            # Kiểm tra layers
            if ($json.layers) {
                Write-Host "📊 Tìm thấy $($json.layers.Count) layers" -ForegroundColor Cyan
                
                # Kiểm tra teams có layer hợp lệ
                $validLayers = $json.layers | ForEach-Object { $_.layer_code }
                $invalidLayerTeams = $json.teams | Where-Object { $_.layer -notin $validLayers }
                if ($invalidLayerTeams) {
                    Write-Host "⚠️  Cảnh báo: Có teams với layer không hợp lệ" -ForegroundColor Yellow
                }
            }
            
            Write-Host "✅ Cấu trúc teams hợp lệ" -ForegroundColor Green
        } else {
            Write-Host "❌ Không tìm thấy mảng 'teams'" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "❌ JSON syntax không hợp lệ: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Restore-Teams {
    param([string]$BackupFileName)
    
    if (!$BackupFileName) {
        # Hiển thị danh sách backup files
        $backupFiles = Get-ChildItem "$BackupDir\teams_backup_*.json" | Sort-Object LastWriteTime -Descending
        
        if ($backupFiles.Count -eq 0) {
            Write-Host "❌ Không tìm thấy file backup nào" -ForegroundColor Red
            return
        }
        
        Write-Host "📁 Danh sách backup files:" -ForegroundColor Cyan
        for ($i = 0; $i -lt $backupFiles.Count; $i++) {
            $file = $backupFiles[$i]
            Write-Host "  [$($i+1)] $($file.Name) - $($file.LastWriteTime)" -ForegroundColor Gray
        }
        
        $choice = Read-Host "Chọn file để restore (1-$($backupFiles.Count)) hoặc nhập tên file"
        
        if ($choice -match '^\d+$' -and [int]$choice -le $backupFiles.Count -and [int]$choice -gt 0) {
            $BackupFileName = $backupFiles[[int]$choice - 1].Name
        } else {
            $BackupFileName = $choice
        }
    }
    
    $backupPath = "$BackupDir\$BackupFileName"
    
    if (!(Test-Path $backupPath)) {
        Write-Host "❌ Không tìm thấy file backup: $backupPath" -ForegroundColor Red
        return
    }
    
    # Validate backup file trước khi restore
    Write-Host "🔍 Kiểm tra file backup..." -ForegroundColor Yellow
    try {
        $backupContent = Get-Content $backupPath -Raw
        $backupJson = $backupContent | ConvertFrom-Json
        
        if (!$backupJson.teams) {
            Write-Host "❌ File backup không hợp lệ" -ForegroundColor Red
            return
        }
        
        Write-Host "✅ File backup hợp lệ ($($backupJson.teams.Count) teams)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ File backup bị lỗi: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    # Tạo backup của file hiện tại trước khi restore
    if (Test-Path $ConfigPath) {
        Write-Host "💾 Tạo backup file hiện tại..." -ForegroundColor Yellow
        Backup-Teams
    }
    
    # Restore
    try {
        Copy-Item $backupPath $ConfigPath -Force
        Write-Host "✅ Restore thành công từ: $BackupFileName" -ForegroundColor Green
        Write-Host "🔄 Hãy restart API server để áp dụng thay đổi" -ForegroundColor Yellow
    }
    catch {
        Write-Host "❌ Lỗi khi restore: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-Teams {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return
    }
    
    try {
        $content = Get-Content $ConfigPath -Raw
        $json = $content | ConvertFrom-Json
        
        Write-Host "🏢 Danh sách Teams trong hệ thống:" -ForegroundColor Cyan
        Write-Host ""
        
        # Group by layer
        $teamsByLayer = $json.teams | Group-Object layer | Sort-Object Name
        
        foreach ($layerGroup in $teamsByLayer) {
            $layerInfo = $json.layers | Where-Object { $_.layer_code -eq $layerGroup.Name }
            $layerName = if ($layerInfo) { $layerInfo.layer_name } else { $layerGroup.Name }
            
            Write-Host "📊 $($layerGroup.Name) - $layerName" -ForegroundColor Yellow
            Write-Host "=" * 50 -ForegroundColor Gray
            
            $layerGroup.Group | Sort-Object id | ForEach-Object {
                $status = if ($_.is_active) { "🟢 Active" } else { "🔴 Inactive" }
                $manager = if ($_.manager_id) { "Manager ID: $($_.manager_id)" } else { "No Manager" }
                
                Write-Host "ID: $($_.id) | Code: $($_.team_code) | Name: $($_.team_name)" -ForegroundColor White
                Write-Host "   Status: $status | $manager" -ForegroundColor Gray
                Write-Host "   Description: $($_.description)" -ForegroundColor Gray
                Write-Host ""
            }
        }
        
        Write-Host "📊 Tổng cộng: $($json.teams.Count) teams" -ForegroundColor Cyan
        Write-Host "🟢 Active: $(($json.teams | Where-Object { $_.is_active }).Count)" -ForegroundColor Green
        Write-Host "🔴 Inactive: $(($json.teams | Where-Object { !$_.is_active }).Count)" -ForegroundColor Red
        
        if ($json.layers) {
            Write-Host "📋 Layers: $($json.layers.Count)" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "❌ Lỗi khi đọc file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    "backup" { Backup-Teams }
    "validate" { Test-Teams }
    "restore" { Restore-Teams -BackupFileName $BackupFile }
    "list" { Get-Teams }
    "help" { Show-Help }
}
