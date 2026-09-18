$ErrorActionPreference = 'Stop'

$loopPath = (Resolve-Path (Join-Path $PSScriptRoot '..\scripts\ralph-loop.ps1')).Path
& $loopPath `
    -Objective 'Exercise one externally requested context rotation, then complete.' `
    -Workspace $env:RALPH_TEST_WORKSPACE `
    -MaxIterations 3 `
    -MaxEventLogBytes 65536 `
    -MaxCompletedEvents 1000 `
    -MaxSessionMinutes 5 `
    -CheckpointGraceMinutes 1 `
    -CodexCommand $env:RALPH_TEST_POWERSHELL `
    -CodexCommandPrefixArguments @('-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $PSScriptRoot 'fake-codex.ps1'))
exit $LASTEXITCODE
