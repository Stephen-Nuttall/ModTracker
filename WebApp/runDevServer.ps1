param (
    [string]$Path = "./"
)

# Write-Host "Starting FastAPI server..."
# Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; python -m uvicorn pyServer:app --reload --host 0.0.0.0 --port 8000"

Write-Host "Starting React app..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; npm run dev"