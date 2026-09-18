[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$testWorkspace = Join-Path $PSScriptRoot ('.tmp-' + (Get-Date -Format 'yyyyMMddHHmmssfff'))
$counterPath = Join-Path $testWorkspace 'counter.txt'
$queueMarkerPath = Join-Path $testWorkspace 'queue-marker.txt'
$powershellPath = (Get-Process -Id $PID).Path

try {
    New-Item -ItemType Directory -Path $testWorkspace -Force | Out-Null
    & git init --quiet $testWorkspace
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to initialize the test Git repository.'
    }

    $env:RALPH_TEST_WORKSPACE = $testWorkspace
    $env:RALPH_TEST_COUNTER = $counterPath
    $env:RALPH_TEST_QUEUE_MARKER = $queueMarkerPath
    $env:RALPH_TEST_POWERSHELL = $powershellPath

    $wrapperOutput = & $powershellPath `
        -NoLogo `
        -NoProfile `
        -ExecutionPolicy Bypass `
        -File (Join-Path $PSScriptRoot 'invoke-fixture.ps1') 2>&1 | Out-String
    $wrapperExitCode = $LASTEXITCODE

    if ($wrapperExitCode -ne 0) {
        throw "Ralph fixture failed with exit code $wrapperExitCode.`n$wrapperOutput"
    }
    if ((Get-Content -Raw -LiteralPath $counterPath).Trim() -ne '2') {
        throw 'Expected exactly two fresh exec processes.'
    }
    if (-not (Test-Path -LiteralPath $queueMarkerPath)) {
        throw 'The event-volume boundary did not queue a checkpoint request.'
    }
    if ($wrapperOutput -match 'item\.completed' -or $wrapperOutput -match ('x' * 100)) {
        throw 'Raw child events leaked into supervising output.'
    }

    $runDirectories = @(Get-ChildItem -LiteralPath (Join-Path $testWorkspace '.ralph\runs') -Directory)
    if ($runDirectories.Count -ne 1) {
        throw "Expected one Ralph run directory; found $($runDirectories.Count)."
    }

    $eventLogs = @(Get-ChildItem -LiteralPath $runDirectories[0].FullName -Filter '*-events.jsonl' -File | Sort-Object Name)
    if ($eventLogs.Count -ne 2) {
        throw "Expected two per-iteration event logs; found $($eventLogs.Count)."
    }

    $threadIds = @()
    foreach ($eventLog in $eventLogs) {
        $startedEvent = Get-Content -LiteralPath $eventLog.FullName | ForEach-Object {
            try { $_ | ConvertFrom-Json -ErrorAction Stop } catch { $null }
        } | Where-Object { $_.type -eq 'thread.started' } | Select-Object -First 1
        $threadIds += $startedEvent.thread_id
    }
    if (($threadIds | Select-Object -Unique).Count -ne 2) {
        throw 'The two iterations did not receive unique thread IDs.'
    }

    Write-Output 'Ralph context-isolation fixture: PASS'
}
finally {
    Remove-Item Env:RALPH_TEST_WORKSPACE -ErrorAction SilentlyContinue
    Remove-Item Env:RALPH_TEST_COUNTER -ErrorAction SilentlyContinue
    Remove-Item Env:RALPH_TEST_QUEUE_MARKER -ErrorAction SilentlyContinue
    Remove-Item Env:RALPH_TEST_POWERSHELL -ErrorAction SilentlyContinue

    if (Test-Path -LiteralPath $testWorkspace) {
        $resolvedTestWorkspace = (Resolve-Path -LiteralPath $testWorkspace).Path
        $resolvedTestsRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
        if (-not $resolvedTestWorkspace.StartsWith($resolvedTestsRoot + [IO.Path]::DirectorySeparatorChar)) {
            throw "Refusing to remove unexpected test path: $resolvedTestWorkspace"
        }
        Remove-Item -LiteralPath $resolvedTestWorkspace -Recurse -Force
    }
}
