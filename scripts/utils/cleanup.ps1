# 1시간 이상된 파일 및 디렉터리를 정리하는 스크립트

# 정리할 대상 경로 목록
$pathsToClean = @(
    "test-results",
    "screenshots",
    "baseline-screenshots",
    "diff-screenshots"
)

# 시간 기준 (현재 시간으로부터 1시간 전)
$limit = (Get-Date).AddHours(-1)

# 각 경로에 대해 정리 작업 수행
foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Write-Host "Checking for old files in '$path'..."
        # 기준 시간보다 오래된 모든 항목(파일 및 디렉터리)을 가져옴
        Get-ChildItem -Path $path -Recurse | Where-Object { $_.LastWriteTime -lt $limit } | ForEach-Object {
            Write-Host "Deleting: $($_.FullName)"
            Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Directory not found: '$path'. Skipping."
    }
}

# 테스트 코드 내 스냅샷 디렉터리 정리
$testSnapshotPath = "tests/e2e"
if (Test-Path $testSnapshotPath) {
    Write-Host "Checking for old snapshot directories in '$testSnapshotPath'..."
    Get-ChildItem -Path $testSnapshotPath -Recurse -Directory | Where-Object { $_.Name -like "*-snapshots" -and $_.LastWriteTime -lt $limit } | ForEach-Object {
        Write-Host "Deleting snapshot directory: $($_.FullName)"
        Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Cleanup script finished." 