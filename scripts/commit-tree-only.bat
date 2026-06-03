@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0\.."
set GIT_AUTHOR_NAME=AutoEcom
set GIT_AUTHOR_EMAIL=apocaliptobg@gmail.com
set GIT_COMMITTER_NAME=AutoEcom
set GIT_COMMITTER_EMAIL=apocaliptobg@gmail.com
for /f %%i in ('git write-tree') do set TREE=%%i
for /f %%i in ('git rev-parse HEAD') do set PARENT=%%i
for /f %%i in ('git commit-tree !TREE! -p !PARENT! -m "%~1"') do set COMMIT=%%i
git update-ref refs/heads/main !COMMIT!
echo !COMMIT!
