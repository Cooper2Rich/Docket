# communications authorization matrix

| Actor | Operation | Resource | Condition | Decision | Error |
| --- | --- | --- | --- | --- | --- |
| authorized initiating actor | createNoticeIntent | accepted recipient projection | current authority version and permitted recipient | allow | — |
| unauthorized actor | createNoticeIntent | private recipient | missing or stale authority | deny | RECIPIENT_UNAUTHORIZED |
| other account | readAccessInbox | foreign inbox | account does not match recipient | deny | RECIPIENT_UNAUTHORIZED |
| recipient | readAccessInbox | own inbox | authenticated account matches recipient | allow | — |
