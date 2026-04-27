@echo off
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%CD%\index.html"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%CD%\index.html"
) else (
  echo Chrome nao encontrado
  pause
)
