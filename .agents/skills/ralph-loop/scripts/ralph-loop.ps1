[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Objective,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Workspace,

    [ValidateRange(1, 200)]
    [int]$MaxIterations = 20,

    [string]$Model,

    [ValidateRange(65536, 10485760)]
    [long]$MaxEventLogBytes = 524288,

    [ValidateRange(5, 1000)]
    [int]$MaxCompletedEvents = 80,

    [ValidateRange(1, 240)]
    [int]$MaxSessionMinutes = 45,

    [ValidateRange(1, 60)]
    [int]$CheckpointGraceMinutes = 10,

    [string]$CodexCommand = 'codex',

    [string[]]$CodexCommandPrefixArguments = @()
)

$ErrorActionPreference = 'Stop'

$workspacePath = (Resolve-Path -LiteralPath $Workspace).Path
$gitDirectory = Join-Path $workspacePath '.git'
if (-not (Test-Path -LiteralPath $gitDirectory)) {
    throw "Workspace is not a Git repository: $workspacePath"
}

$codexCommandInfo = Get-Command $CodexCommand -ErrorAction Stop
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$runDirectory = Join-Path $workspacePath ".ralph\runs\$timestamp"
New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null

$objectivePath = Join-Path $runDirectory 'objective.md'
$progressPath = Join-Path $runDirectory 'progress.md'
$Objective | Set-Content -LiteralPath $objectivePath -Encoding utf8
@(
    '# Ralph progress'
    ''
    "Run started: $(Get-Date -Format o)"
    ''
) | Set-Content -LiteralPath $progressPath -Encoding utf8

Write-Host "Ralph run directory: $runDirectory"

function Start-CodexChild {
    param(
        [string[]]$Arguments,
        [string]$StandardOutputPath,
        [string]$StandardErrorPath
    )

    $commandLine = (@($CodexCommandPrefixArguments) + $Arguments | ForEach-Object {
        ConvertTo-CommandLineArgument -Argument $_
    }) -join ' '

    return Start-Process `
        -FilePath $codexCommandInfo.Source `
        -ArgumentList $commandLine `
        -RedirectStandardOutput $StandardOutputPath `
        -RedirectStandardError $StandardErrorPath `
        -WindowStyle Hidden `
        -PassThru
}

function ConvertTo-CommandLineArgument {
    param([AllowEmptyString()][string]$Argument)

    if ($Argument.Length -gt 0 -and $Argument -notmatch '[\s"]') {
        return $Argument
    }

    $quoted = '"'
    $backslashCount = 0
    foreach ($character in $Argument.ToCharArray()) {
        if ($character -eq '\') {
            $backslashCount++
            continue
        }

        if ($character -eq '"') {
            $quoted += ('\' * (($backslashCount * 2) + 1)) + '"'
        }
        else {
            $quoted += ('\' * $backslashCount) + $character
        }
        $backslashCount = 0
    }

    $quoted += ('\' * ($backslashCount * 2)) + '"'
    return $quoted
}

function Receive-CodexEvents {
    param(
        [string]$Path,
        [int]$StartIndex,
        [string]$KnownThreadId,
        [int]$KnownCompletedEvents,
        [int]$Iteration
    )

    $lines = @(Get-Content -LiteralPath $Path -ErrorAction SilentlyContinue)
    $threadId = $KnownThreadId
    $completedEvents = $KnownCompletedEvents

    for ($index = $StartIndex; $index -lt $lines.Count; $index++) {
        try {
            $event = $lines[$index] | ConvertFrom-Json -ErrorAction Stop
            if ($event.type -eq 'thread.started' -and -not $threadId) {
                $threadId = $event.thread_id
                Write-Host "Ralph iteration $Iteration thread: $threadId"
            }
            if ($event.type -eq 'item.completed') {
                $completedEvents++
            }
        }
        catch {
            # Preserve non-JSON diagnostics in the event log.
        }
    }

    return [pscustomobject]@{
        LineCount = $lines.Count
        ThreadId = $threadId
        CompletedEvents = $completedEvents
    }
}

function Send-CheckpointRequest {
    param(
        [string]$ThreadId,
        [string]$Message,
        [string]$LogPath
    )

    $queueArguments = @($CodexCommandPrefixArguments) + @(
        'queue'
        '--thread', $ThreadId
        '--message', $Message
    )

    & $codexCommandInfo.Source @queueArguments *> $LogPath
    return $LASTEXITCODE
}

$consecutiveFailures = 0
for ($iteration = 1; $iteration -le $MaxIterations; $iteration++) {
    $lastMessagePath = Join-Path $runDirectory ("iteration-{0:D3}-last-message.txt" -f $iteration)
    $eventLogPath = Join-Path $runDirectory ("iteration-{0:D3}-events.jsonl" -f $iteration)
    $stderrLogPath = Join-Path $runDirectory ("iteration-{0:D3}-stderr.log" -f $iteration)
    $queueLogPath = Join-Path $runDirectory ("iteration-{0:D3}-queue.log" -f $iteration)

    $prompt = @"
You are iteration $iteration of a bounded Ralph loop. This process is one disposable context slice, not the whole objective.

Read the objective at: $objectivePath
Read the durable handoff at: $progressPath

Inspect the current repository state and git diff before acting. Work on the highest-impact unfinished part of the objective. Make one coherent set of changes and run relevant verification. Checkpoint after every material milestone so a forced context rotation loses no durable state. Keep command output in the event log and append concise entries to progress.md containing: changes made, verification and results, remaining work, and blockers.

Finish this iteration before its context budget is exhausted. When you receive a queued boundary message, finish only the current atomic operation, append the handoff, and return RALPH_LOOP_CONTINUE. Do not begin another operation after that message.

When every acceptance criterion is satisfied and verified, end your final response with this standalone line:
RALPH_LOOP_COMPLETE

When progress requires user input, new permission, an unavailable dependency, or a changed issue contract, append the blocker to progress.md and end your final response with this standalone line:
RALPH_LOOP_BLOCKED

When more work remains, end your final response with this standalone line:
RALPH_LOOP_CONTINUE
"@

    $arguments = @(
        'exec'
        '--json'
        '--strict-config'
        '--approve-for-me'
        '--cd', $workspacePath
        '--output-last-message', $lastMessagePath
        '--config', 'model_context_window=180000'
        '--config', 'model_auto_compact_token_limit=2000000'
        '--config', 'model_auto_compact_token_limit_scope="total"'
    )
    if ($Model) {
        $arguments += @('--model', $Model)
    }
    $arguments += $prompt

    Write-Host "Starting Ralph iteration $iteration of $MaxIterations"

    New-Item -ItemType File -Path $eventLogPath -Force | Out-Null
    New-Item -ItemType File -Path $stderrLogPath -Force | Out-Null
    $process = Start-CodexChild -Arguments $arguments -StandardOutputPath $eventLogPath -StandardErrorPath $stderrLogPath
    $startedAt = Get-Date
    $threadId = $null
    $completedEvents = 0
    $eventBytes = 0L
    $eventLineCount = 0
    $boundaryReason = $null
    $boundaryDetectedAt = $null
    $checkpointRequestedAt = $null
    $forcedBoundary = $false
    try {
        while (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
            $eventState = Receive-CodexEvents `
                -Path $eventLogPath `
                -StartIndex $eventLineCount `
                -KnownThreadId $threadId `
                -KnownCompletedEvents $completedEvents `
                -Iteration $iteration
            $eventLineCount = $eventState.LineCount
            $threadId = $eventState.ThreadId
            $completedEvents = $eventState.CompletedEvents
            $eventBytes = (Get-Item -LiteralPath $eventLogPath).Length

            $elapsed = (Get-Date) - $startedAt
            if (-not $boundaryReason) {
                if ($eventBytes -ge $MaxEventLogBytes) {
                    $boundaryReason = "event log reached $eventBytes bytes"
                }
                elseif ($completedEvents -ge $MaxCompletedEvents) {
                    $boundaryReason = "completed event count reached $completedEvents"
                }
                elseif ($elapsed.TotalMinutes -ge $MaxSessionMinutes) {
                    $boundaryReason = "elapsed time reached $([math]::Round($elapsed.TotalMinutes, 1)) minutes"
                }

                if ($boundaryReason) {
                    $boundaryDetectedAt = Get-Date
                }
            }

            if ($boundaryReason -and -not $checkpointRequestedAt -and $threadId) {
                $checkpointMessage = @"
Ralph session boundary reached: $boundaryReason. Finish only the current atomic operation. Append a concise durable handoff to $progressPath with changes, verification, remaining work, and blockers. Then end this turn with the standalone line RALPH_LOOP_CONTINUE. Do not start another operation and do not compact this session.
"@
                $queueExitCode = Send-CheckpointRequest -ThreadId $threadId -Message $checkpointMessage -LogPath $queueLogPath
                $checkpointRequestedAt = Get-Date
                Write-Host "Requested checkpoint for iteration $iteration ($boundaryReason; queue exit $queueExitCode)."
            }

            $graceStartedAt = if ($checkpointRequestedAt) { $checkpointRequestedAt } else { $boundaryDetectedAt }
            if ($graceStartedAt -and (((Get-Date) - $graceStartedAt).TotalMinutes -ge $CheckpointGraceMinutes)) {
                $forcedBoundary = $true
                & taskkill.exe /PID $process.Id /T /F *> $null
                Write-Host "Stopped iteration $iteration after the checkpoint grace period."
            }

            Start-Sleep -Milliseconds 100
        }

        Wait-Process -Id $process.Id -ErrorAction SilentlyContinue
        $eventState = Receive-CodexEvents `
            -Path $eventLogPath `
            -StartIndex $eventLineCount `
            -KnownThreadId $threadId `
            -KnownCompletedEvents $completedEvents `
            -Iteration $iteration
        $threadId = $eventState.ThreadId
        $completedEvents = $eventState.CompletedEvents
        $eventBytes = (Get-Item -LiteralPath $eventLogPath).Length
        $exitCode = $process.ExitCode
    }
    finally {
        if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
            & taskkill.exe /PID $process.Id /T /F *> $null
        }
    }

    if ($forcedBoundary) {
        Add-Content -LiteralPath $progressPath -Encoding utf8 -Value @"

## Iteration $iteration forced context rotation

- Boundary: $boundaryReason
- The child did not finish within the $CheckpointGraceMinutes-minute checkpoint grace period.
- Inspect repository state and the iteration logs before continuing.
"@
        $consecutiveFailures = 0
        continue
    }

    if ($exitCode -ne 0) {
        $consecutiveFailures++
        Add-Content -LiteralPath $progressPath -Encoding utf8 -Value @"

## Iteration $iteration execution failure

- Exit code: $exitCode
- Event log: $eventLogPath
- Stderr log: $stderrLogPath
"@
        if ($consecutiveFailures -ge 3) {
            [Console]::Error.WriteLine("Stopped after three consecutive Codex execution failures. Run directory: $runDirectory")
            exit 3
        }
        continue
    }

    $consecutiveFailures = 0
    if (Test-Path -LiteralPath $lastMessagePath) {
        $lastMessage = Get-Content -Raw -LiteralPath $lastMessagePath
        if ($lastMessage -match '(?m)^RALPH_LOOP_BLOCKED\s*$') {
            [Console]::Error.WriteLine("Ralph loop blocked in iteration $iteration. Run directory: $runDirectory")
            exit 4
        }
        if ($lastMessage -match '(?m)^RALPH_LOOP_COMPLETE\s*$') {
            Write-Host "Ralph loop completed in $iteration iteration(s)."
            Write-Host "Run directory: $runDirectory"
            exit 0
        }
    }
}

[Console]::Error.WriteLine("Ralph loop reached the iteration limit without completion. Run directory: $runDirectory")
exit 2
