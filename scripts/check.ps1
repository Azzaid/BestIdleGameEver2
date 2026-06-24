$ErrorActionPreference = "Stop"
$NodeVersion = (Get-Content -Raw ".\.node-version").Trim()

function Invoke-PinnedNode {
    param(
        [string]$Label,
        [string]$Tool,
        [string[]]$ToolArgs
    )

    Write-Host "==> $Label"
    & fnm exec --using $NodeVersion node $Tool @ToolArgs

    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed with exit code $LASTEXITCODE"
    }
}

Invoke-PinnedNode "Lint" ".\node_modules\eslint\bin\eslint.js" @(".")
Invoke-PinnedNode "TypeScript" ".\node_modules\typescript\bin\tsc" @("-b")
Invoke-PinnedNode "Vite build" ".\node_modules\vite\bin\vite.js" @("build")
