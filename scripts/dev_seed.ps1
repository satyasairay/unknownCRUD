param(
    [string]$PythonExecutable = "python"
)

Write-Host "Seeding sample Unknown CRUD Library data..."
& $PythonExecutable "scripts/seed_data.py"
if ($LASTEXITCODE -ne 0) {
    throw "Seeding failed with exit code $LASTEXITCODE"
}
Write-Host "Seed completed."
