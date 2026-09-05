@ECHO OFF
SET "DIRNAME=%~dp0"
IF "%DIRNAME%"=="" SET "DIRNAME=."
"%DIRNAME%.mvn\apache-maven-3.9.9\bin\mvn.cmd" %*
