@echo off
cd /d "%~dp0.."
set GIT_AUTHOR_NAME=AutoEcom
set GIT_AUTHOR_EMAIL=apocaliptobg@gmail.com
set GIT_COMMITTER_NAME=AutoEcom
set GIT_COMMITTER_EMAIL=apocaliptobg@gmail.com
for /f %%i in ('git write-tree') do set TREE=%%i
for /f %%i in ('git commit-tree %TREE% -F .git\COMMIT_MSG_CLEAN.txt') do set COMMIT=%%i
git reset --hard %COMMIT%
git push origin main --force
