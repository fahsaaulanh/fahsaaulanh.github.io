@echo off
setlocal enabledelayedexpansion
cd /d D:\fahsaaulanh.github.io\images\Robolab

set i=1
for %%f in (*.*) do (
    set "ext=%%~xf"
    set "num=00!i!"
    set "num=!num:~-3!"
    ren "%%f" "robolab_!num!!ext!"
    set /a i+=1
)

echo Selesai mengganti nama semua file menjadi format robolab_001.*
pause
