@echo off
setlocal
echo ========================================================
echo   FoodieExpress Spring Boot Backend Server
echo   Port: http://localhost:8080
echo   H2 Console: http://localhost:8080/h2-console
echo ========================================================
echo.

:: Add local Tools Maven to PATH if present
if exist "C:\Users\MADHAN SRI SAI\Tools\apache-maven-3.9.9\bin" (
    set "PATH=C:\Users\MADHAN SRI SAI\Tools\apache-maven-3.9.9\bin;%PATH%"
)

where mvn >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting Spring Boot backend with Dev profile (H2 in-memory fallback)...
    mvn spring-boot:run -Dspring-boot.run.profiles=dev
    goto end
)

if exist "target\food-app-0.0.1-SNAPSHOT.jar" (
    echo Starting from target\food-app-0.0.1-SNAPSHOT.jar...
    java -jar target\food-app-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
    goto end
)

echo [ERROR] Maven was not found. Please install Maven or check your PATH.
pause

:end
endlocal
