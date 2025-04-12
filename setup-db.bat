@echo off
echo 正在设置数据库...
call npx prisma db push
if %ERRORLEVEL% EQU 0 (
  echo 数据库设置成功！
) else (
  echo 数据库设置失败，请查看错误信息。
)
pause
