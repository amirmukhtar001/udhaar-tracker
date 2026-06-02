# Build Android AAB — uploads THIS folder (not old git snapshot).
Write-Host "EAS_NO_VCS=1 (required: Gradle fixes must reach EAS)" -ForegroundColor Cyan
$env:EAS_NO_VCS = "1"
if (-not (Test-Path "E:\temp")) { New-Item -ItemType Directory -Force -Path "E:\temp" | Out-Null }
$env:TEMP = "E:\temp"
$env:TMP = "E:\temp"
npx eas-cli@latest build -p android --profile production @args
