$toolsMvn = "C:\Users\MADHAN SRI SAI\Tools\apache-maven-3.9.9\bin"
if (Test-Path $toolsMvn) {
    $env:PATH = "$toolsMvn;$env:PATH"
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  FoodieExpress Spring Boot Backend Server" -ForegroundColor Cyan
Write-Host "  Base URL: http://localhost:8080/api" -ForegroundColor Green
Write-Host "  H2 DB Console: http://localhost:8080/h2-console" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

if (Get-Command mvn -ErrorAction SilentlyContinue) {
    Write-Host "Starting with Maven (Dev profile with H2 in-memory DB)..." -ForegroundColor Yellow
    mvn spring-boot:run -Dspring-boot.run.profiles=dev
} elseif (Test-Path "target\food-app-0.0.1-SNAPSHOT.jar") {
    Write-Host "Starting with compiled JAR..." -ForegroundColor Yellow
    java -jar target\food-app-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
} else {
    Write-Host "Maven was not found. Please install Maven or check your PATH." -ForegroundColor Red
}
