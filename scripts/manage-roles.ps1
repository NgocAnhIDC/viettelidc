# KPI TT Cloud - Role Management Script
# Sử dụng: .\manage-roles.ps1 [backup|validate|restore|list]
# Tương tự: .\manage-teams.ps1 [backup|validate|restore|list]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "validate", "restore", "list", "help")]
    [string]$Action,
    
    [string]$BackupFile = ""
)

$ConfigPath = "api\config\roles.json"
$BackupDir = "api\config\backups"

# Tạo thư mục backup nếu chưa có
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

function Show-Help {
    Write-Host "🛡️  KPI TT Cloud - Role Management Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Cách sử dụng:" -ForegroundColor Yellow
    Write-Host "  .\manage-roles.ps1 backup          # Tạo backup file roles.json"
    Write-Host "  .\manage-roles.ps1 validate        # Kiểm tra syntax JSON"
    Write-Host "  .\manage-roles.ps1 restore [file]  # Restore từ backup"
    Write-Host "  .\manage-roles.ps1 list            # Liệt kê tất cả roles"
    Write-Host "  .\manage-roles.ps1 help            # Hiển thị hướng dẫn"
    Write-Host ""
    Write-Host "Ví dụ:" -ForegroundColor Green
    Write-Host "  .\manage-roles.ps1 backup"
    Write-Host "  .\manage-roles.ps1 restore roles_backup_20241217_143022.json"
}

function Backup-Roles {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = "$BackupDir\roles_backup_$timestamp.json"
    
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

function Validate-Roles {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return $false
    }
    
    try {
        $content = Get-Content $ConfigPath -Raw
        $json = $content | ConvertFrom-Json
        
        Write-Host "✅ JSON syntax hợp lệ" -ForegroundColor Green
        
        # Kiểm tra cấu trúc
        if ($json.roles) {
            Write-Host "📋 Tìm thấy $($json.roles.Count) roles" -ForegroundColor Cyan
            
            # Kiểm tra role ADMIN
            $adminRole = $json.roles | Where-Object { $_.role_code -eq "ADMIN" }
            if ($adminRole) {
                Write-Host "🔐 Role ADMIN tồn tại" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Cảnh báo: Không tìm thấy role ADMIN" -ForegroundColor Yellow
            }
            
            # Kiểm tra duplicate IDs
            $duplicateIds = $json.roles | Group-Object id | Where-Object { $_.Count -gt 1 }
            if ($duplicateIds) {
                Write-Host "❌ Phát hiện ID trùng lặp: $($duplicateIds.Name -join ', ')" -ForegroundColor Red
                return $false
            }
            
            # Kiểm tra required fields
            $invalidRoles = $json.roles | Where-Object { 
                !$_.id -or !$_.role_code -or !$_.role_name 
            }
            if ($invalidRoles) {
                Write-Host "❌ Phát hiện roles thiếu thông tin bắt buộc" -ForegroundColor Red
                return $false
            }
            
            Write-Host "✅ Cấu trúc roles hợp lệ" -ForegroundColor Green
        } else {
            Write-Host "❌ Không tìm thấy mảng 'roles'" -ForegroundColor Red
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "❌ JSON syntax không hợp lệ: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Restore-Roles {
    param([string]$BackupFileName)
    
    if (!$BackupFileName) {
        # Hiển thị danh sách backup files
        $backupFiles = Get-ChildItem "$BackupDir\roles_backup_*.json" | Sort-Object LastWriteTime -Descending
        
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
        
        if (!$backupJson.roles) {
            Write-Host "❌ File backup không hợp lệ" -ForegroundColor Red
            return
        }
        
        Write-Host "✅ File backup hợp lệ ($($backupJson.roles.Count) roles)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ File backup bị lỗi: $($_.Exception.Message)" -ForegroundColor Red
        return
    }
    
    # Tạo backup của file hiện tại trước khi restore
    if (Test-Path $ConfigPath) {
        Write-Host "💾 Tạo backup file hiện tại..." -ForegroundColor Yellow
        Backup-Roles
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

function List-Roles {
    if (!(Test-Path $ConfigPath)) {
        Write-Host "❌ Không tìm thấy file $ConfigPath" -ForegroundColor Red
        return
    }
    
    try {
        $content = Get-Content $ConfigPath -Raw
        $json = $content | ConvertFrom-Json
        
        Write-Host "📋 Danh sách Roles trong hệ thống:" -ForegroundColor Cyan
        Write-Host ""
        
        $json.roles | Sort-Object category, id | ForEach-Object {
            $status = if ($_.is_active) { "🟢 Active" } else { "🔴 Inactive" }
            $permissions = @()
            if ($_.permissions.canView) { $permissions += "View" }
            if ($_.permissions.canCreate) { $permissions += "Create" }
            if ($_.permissions.canEdit) { $permissions += "Edit" }
            if ($_.permissions.canDelete) { $permissions += "Delete" }
            if ($_.permissions.canApprove) { $permissions += "Approve" }
            if ($_.permissions.canImport) { $permissions += "Import" }
            
            Write-Host "ID: $($_.id) | Code: $($_.role_code) | Name: $($_.role_name)" -ForegroundColor White
            Write-Host "   Category: $($_.category) | Status: $status" -ForegroundColor Gray
            Write-Host "   Permissions: $($permissions -join ', ') | Scope: $($_.permissions.scope)" -ForegroundColor Gray
            Write-Host "   Description: $($_.description)" -ForegroundColor Gray
            Write-Host ""
        }
        
        Write-Host "📊 Tổng cộng: $($json.roles.Count) roles" -ForegroundColor Cyan
        Write-Host "🟢 Active: $(($json.roles | Where-Object { $_.is_active }).Count)" -ForegroundColor Green
        Write-Host "🔴 Inactive: $(($json.roles | Where-Object { !$_.is_active }).Count)" -ForegroundColor Red
    }
    catch {
        Write-Host "❌ Lỗi khi đọc file: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    "backup" { Backup-Roles }
    "validate" { Validate-Roles }
    "restore" { Restore-Roles -BackupFileName $BackupFile }
    "list" { List-Roles }
    "help" { Show-Help }
}
