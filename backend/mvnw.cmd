@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%"=="" @ECHO OFF
@SETLOCAL LEAVE_ENVIRONMENT_ALONE

SET ERROR_CODE=0

@REM Set the script directory
SET "DIRNAME=%~dp0"
IF "%DIRNAME%"=="" SET "DIRNAME=."
SET "BASE_DIR=%DIRNAME%"

@REM Determine the Java command to use to start the JVM.
IF NOT "%JAVA_HOME%"=="" (
  SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
) ELSE (
  SET "JAVACMD=java.exe"
)

SET "WRAPPER_JAR=%BASE_DIR%\.mvn\wrapper\maven-wrapper.jar"
SET "WRAPPER_PROP=%BASE_DIR%\.mvn\wrapper\maven-wrapper.properties"

IF NOT EXIST "%WRAPPER_JAR%" (
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile((Get-Content '%WRAPPER_PROP%' | Where-Object { $_ -match 'wrapperUrl=(.*)' } | ForEach-Object { $Matches[1] }), '%WRAPPER_JAR%')"
)

"%JAVACMD%" -jar "%WRAPPER_JAR%" %*
IF ERRORLEVEL 1 (
  SET ERROR_CODE=1
)

EXIT /B %ERROR_CODE%
