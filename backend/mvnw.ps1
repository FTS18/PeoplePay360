$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$scriptDir\.mvn\apache-maven-3.9.9\bin\mvn.cmd" @args
