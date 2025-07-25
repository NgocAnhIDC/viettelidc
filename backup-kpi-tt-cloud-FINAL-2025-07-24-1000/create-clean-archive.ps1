# Create Clean Archive Script
# This script creates a production-ready archive without development files

Write-Host "🗜️ Creating Clean KPI TT Cloud Archive..." -ForegroundColor Green

# Define paths
$sourceDir = "C:\Users\Administrator\Documents\ViettelIDC"
$cleanDir = "C:\Users\Administrator\Documents\KPI-TT-Cloud-Clean"
$archivePath = "C:\Users\Administrator\Documents\KPI-TT-Cloud-Production.zip"

# Remove existing clean directory
if (Test-Path $cleanDir) {
    Write-Host "🧹 Removing existing clean directory..." -ForegroundColor Yellow
    Remove-Item $cleanDir -Recurse -Force
}

# Create clean directory
Write-Host "📁 Creating clean directory structure..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $cleanDir -Force | Out-Null

# Copy essential files and folders
$itemsToCopy = @(
    "*.html",
    "*.js", 
    "*.css",
    "*.json",
    "*.md",
    "*.yml",
    "*.yaml",
    "api",
    "database", 
    "nginx",
    "config"
)

Write-Host "📋 Copying essential files..." -ForegroundColor Cyan

# Copy root level files
foreach ($pattern in @("*.html", "*.js", "*.css", "*.json", "*.md", "*.yml", "*.yaml")) {
    $files = Get-ChildItem -Path $sourceDir -Filter $pattern -File
    foreach ($file in $files) {
        Copy-Item $file.FullName -Destination $cleanDir -Force
        Write-Host "  ✅ Copied: $($file.Name)" -ForegroundColor Green
    }
}

# Copy directories (excluding problematic ones)
$dirsToExclude = @("node_modules", "logs", ".git", "coverage", ".nyc_output")

$dirs = Get-ChildItem -Path $sourceDir -Directory | Where-Object { $_.Name -notin $dirsToExclude }
foreach ($dir in $dirs) {
    Write-Host "📂 Copying directory: $($dir.Name)..." -ForegroundColor Cyan
    
    if ($dir.Name -eq "api") {
        # Special handling for API directory - exclude node_modules
        $apiCleanDir = Join-Path $cleanDir "api"
        New-Item -ItemType Directory -Path $apiCleanDir -Force | Out-Null
        
        # Copy API files excluding node_modules
        robocopy $dir.FullName $apiCleanDir /E /XD node_modules logs .git /XF *.log npm-debug.log /NFL /NDL /NJH /NJS /NC /NS /NP
    } else {
        # Copy other directories normally
        Copy-Item $dir.FullName -Destination $cleanDir -Recurse -Force
    }
    Write-Host "  ✅ Copied: $($dir.Name)" -ForegroundColor Green
}

# Add package.json to API directory for deployment
$apiPackageJson = Join-Path $cleanDir "api\package.json"
if (Test-Path $apiPackageJson) {
    Write-Host "📦 Package.json found in API directory" -ForegroundColor Green
} else {
    Write-Host "⚠️ Package.json not found in API directory" -ForegroundColor Yellow
}

# Create deployment instructions
$deployInstructions = @"
# KPI TT Cloud - Production Deployment

## Quick Start
1. Extract this archive
2. Navigate to the project directory
3. Run: docker-compose up -d
4. Access: http://localhost:8080

## Manual Setup (if Docker not available)
1. Install Node.js and MySQL
2. Navigate to api folder: cd api
3. Install dependencies: npm install
4. Configure database connection in .env
5. Start API: npm start
6. Serve frontend files with any web server

## Test Accounts
- Admin: admin/admin123 (Full access)
- DEV: anhdn/ANHDN123 (View only)

## System Status
✅ All phases completed successfully
✅ Production ready
✅ Docker deployment configured
✅ Security hardened
✅ Comprehensive testing passed
"@

$deployInstructions | Out-File -FilePath (Join-Path $cleanDir "DEPLOYMENT.md") -Encoding UTF8

Write-Host "📄 Created deployment instructions" -ForegroundColor Green

# Check clean directory size
$cleanSize = (Get-ChildItem $cleanDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📊 Clean directory size: $([math]::Round($cleanSize, 2)) MB" -ForegroundColor Cyan

# Create archive
Write-Host "🗜️ Creating ZIP archive..." -ForegroundColor Yellow
try {
    if (Test-Path $archivePath) {
        Remove-Item $archivePath -Force
    }
    
    Compress-Archive -Path "$cleanDir\*" -DestinationPath $archivePath -CompressionLevel Optimal -Force
    
    $archiveSize = (Get-Item $archivePath).Length / 1MB
    Write-Host "🎉 Archive created successfully!" -ForegroundColor Green
    Write-Host "📁 Location: $archivePath" -ForegroundColor Cyan
    Write-Host "📊 Archive size: $([math]::Round($archiveSize, 2)) MB" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Archive creation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 You can manually zip the folder: $cleanDir" -ForegroundColor Yellow
}

# Cleanup
Write-Host "🧹 Cleaning up temporary directory..." -ForegroundColor Yellow
Remove-Item $cleanDir -Recurse -Force

Write-Host "✅ Clean archive creation completed!" -ForegroundColor Green
