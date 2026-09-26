# identity-access state transition matrix

| From | Command | Guard | To | Rejected from |
| --- | --- | --- | --- | --- |
| active-role-context | switch or leave role context | current version and resolved save/discard decision | selector | cancelled-unsaved-work, stale-context |
| active | expire | absolute or inactivity limit reached | expired | expired, revoked |
| active | revoke | current session authority | revoked | expired, revoked |
| selector | enter role context | current server-side grant and tab-scoped selection | active-role-context | foreign-authority, revoked-authority |
