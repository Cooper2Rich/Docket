[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[^/\s]+/[^/\s]+$')]
    [string]$Repository,

    [Parameter(Mandatory = $true)]
    [ValidateCount(1, 1000)]
    [ValidateRange(1, 2147483647)]
    [int[]]$IssueNumbers,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Workspace,

    [ValidateRange(1, 200)]
    [int]$MaxIterationsPerIssue = 20,

    [string]$Model
)

$ErrorActionPreference = 'Stop'

$workspacePath = (Resolve-Path -LiteralPath $Workspace).Path
$gitDirectory = Join-Path $workspacePath '.git'
if (-not (Test-Path -LiteralPath $gitDirectory)) {
    throw "Workspace is not a Git repository: $workspacePath"
}

if (($IssueNumbers | Select-Object -Unique).Count -ne $IssueNumbers.Count) {
    throw 'Issue queue contains duplicate issue numbers.'
}

$loopScript = Join-Path $PSScriptRoot 'ralph-loop.ps1'
if (-not (Test-Path -LiteralPath $loopScript)) {
    throw "Ralph loop runner is missing: $loopScript"
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$queueDirectory = Join-Path $workspacePath ".ralph\queues\$timestamp"
$queueLogPath = Join-Path $queueDirectory 'queue.md'
New-Item -ItemType Directory -Path $queueDirectory -Force | Out-Null

@(
    '# Ralph issue queue'
    ''
    "Repository: $Repository"
    "Workspace: $workspacePath"
    "Started: $(Get-Date -Format o)"
    "Approved order: $($IssueNumbers -join ', ')"
    ''
) | Set-Content -LiteralPath $queueLogPath -Encoding utf8

Write-Host "Ralph issue queue directory: $queueDirectory"

foreach ($issueNumber in $IssueNumbers) {
    $issueReference = "$Repository#$issueNumber"
    Write-Host "Queue item: $issueReference"

    if (-not $PSCmdlet.ShouldProcess($issueReference, 'Run Ralph loop')) {
        Add-Content -LiteralPath $queueLogPath -Encoding utf8 -Value "- Issue #${issueNumber}: dry run"
        continue
    }

    $objective = @"
Implement exactly GitHub issue #$issueNumber in $Repository.

Before editing, use the authenticated GitHub connector to read the current issue body, comments, labels, state, and blocking relationships. The user approved this issue as part of an exact consecutive queue. If the issue is closed, its contract materially changed after approval, a blocker is unresolved, or the connector is unavailable, record the reason and return RALPH_LOOP_BLOCKED without editing.

Treat the issue's acceptance criteria as mandatory. Stay within its scope, preserve unrelated user changes, and run focused verification plus the relevant regression suite. When all criteria pass, commit only this issue's changes with an issue reference in the commit message. Then post a concise GitHub comment listing the verification commands and evidence, close the issue, and return RALPH_LOOP_COMPLETE. Repository edits, that commit, the verification comment, and closing this issue were authorized by the user's queue sign-off.
"@

    Write-Host "Starting approved issue $issueReference"
    $parameters = @{
        Objective = $objective
        Workspace = $workspacePath
        MaxIterations = $MaxIterationsPerIssue
    }
    if ($Model) {
        $parameters.Model = $Model
    }

    & $loopScript @parameters
    $exitCode = $LASTEXITCODE
    Add-Content -LiteralPath $queueLogPath -Encoding utf8 -Value "- Issue #${issueNumber}: exit code $exitCode at $(Get-Date -Format o)"

    if ($exitCode -ne 0) {
        [Console]::Error.WriteLine("Issue queue stopped at $issueReference with exit code $exitCode. Queue directory: $queueDirectory")
        exit $exitCode
    }
}

Add-Content -LiteralPath $queueLogPath -Encoding utf8 -Value "`nQueue completed: $(Get-Date -Format o)"
Write-Host "Ralph issue queue completed. Queue directory: $queueDirectory"
exit 0
