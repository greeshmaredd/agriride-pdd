@echo off
echo ===================================================
echo   AgriRide 2026 - Sync Screenshots to Phone Gallery
echo ===================================================

adb wait-for-device
echo Phone connected! Preparing Gallery directory on device...

adb shell "mkdir -p /sdcard/Pictures/AgriRide_Gallery"
adb shell "mkdir -p /sdcard/DCIM/AgriRide_Gallery"

echo Pushing all 31 screenshots into Phone Gallery (/sdcard/Pictures/AgriRide_Gallery)...
adb push "AgriRide_Gallery_Screens\." /sdcard/Pictures/AgriRide_Gallery/
adb push "AgriRide_Gallery_Screens\." /sdcard/DCIM/AgriRide_Gallery/

echo Triggering Android MediaScanner to refresh Samsung Gallery album...
for %%F in (AgriRide_Gallery_Screens\*.png) do (
    adb shell "am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d \"file:///sdcard/Pictures/AgriRide_Gallery/%%~nxF\"" >nul 2>&1
    adb shell "am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d \"file:///sdcard/DCIM/AgriRide_Gallery/%%~nxF\"" >nul 2>&1
)

echo.
echo ===================================================
echo   SUCCESS! All 31 screens stored in Phone Gallery!
echo   Open the "Gallery" app on your phone to view:
echo   Album name: AgriRide_Gallery
echo ===================================================
pause
