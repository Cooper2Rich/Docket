[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$CommandArguments
)

$ErrorActionPreference = 'Stop'

if ($CommandArguments[0] -eq 'queue') {
    'checkpoint requested' | Set-Content -LiteralPath $env:RALPH_TEST_QUEUE_MARKER -Encoding utf8
    Write-Output 'queued'
    exit 0
}

if ($CommandArguments[0] -ne 'exec') {
    throw "Unexpected fake Codex command: $($CommandArguments -join ' ')"
}

$count = if (Test-Path -LiteralPath $env:RALPH_TEST_COUNTER) {
    [int](Get-Content -Raw -LiteralPath $env:RALPH_TEST_COUNTER)
}
else {
    0
}
$count++
$count | Set-Content -LiteralPath $env:RALPH_TEST_COUNTER -Encoding ascii

$lastMessageIndex = [array]::IndexOf($CommandArguments, '--output-last-message')
if ($lastMessageIndex -lt 0) {
    throw 'The wrapper did not supply --output-last-message.'
}
$lastMessagePath = $CommandArguments[$lastMessageIndex + 1]
$threadId = '00000000-0000-0000-0000-{0:D12}' -f $count
Write-Output ('{{"type":"thread.started","thread_id":"{0}"}}' -f $threadId)

if ($count -eq 1) {
    $payload = 'x' * 70000
    Write-Output ('{{"type":"item.completed","item":{{"text":"{0}"}}}}' -f $payload)

    for ($attempt = 0; $attempt -lt 300; $attempt++) {
        if (Test-Path -LiteralPath $env:RALPH_TEST_QUEUE_MARKER) {
            "fixture handoff`nRALPH_LOOP_CONTINUE" | Set-Content -LiteralPath $lastMessagePath -Encoding utf8
            exit 0
        }
        Start-Sleep -Milliseconds 100
    }

    throw 'The wrapper did not queue a checkpoint request.'
}

"fixture complete`nRALPH_LOOP_COMPLETE" | Set-Content -LiteralPath $lastMessagePath -Encoding utf8
exit 0
