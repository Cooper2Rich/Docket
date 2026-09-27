# communications state transition matrix

| From | Command | Guard | To | Rejected from |
| --- | --- | --- | --- | --- |
| queued | deliverNotice | provider accepted | delivered |  |
| queued | deliverNotice | provider failed and retries remain | retrying |  |
| retrying | deliverNotice | provider accepted idempotency key | delivered |  |
| retrying | deliverNotice | retry policy exhausted | failed |  |
