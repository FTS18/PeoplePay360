Get-Content (Join-Path $PSScriptRoot ".env") | Where-Object { $_ -match '=' -and -not $_.StartsWith('#') } | ForEach-Object {
    $parts = $_.Split('=', 2)
    [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
}
Set-Location $PSScriptRoot
.\mvnw.cmd spring-boot:run
