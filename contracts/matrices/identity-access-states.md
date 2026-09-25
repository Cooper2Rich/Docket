# identity-access state transition matrix

| From | Command | Guard | To | Rejected from |
| --- | --- | --- | --- | --- |
| active | expire | absolute or inactivity limit reached | expired | expired, revoked |
| active | revoke | current session authority | revoked | expired, revoked |
