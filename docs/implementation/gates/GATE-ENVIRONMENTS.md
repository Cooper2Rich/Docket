# GATE-ENVIRONMENTS: Provision authorized deployment accounts and operational ownership

Type: decision/external gate; not a Ralph implementation item.

## Observed blocker

Actual AWS/Vercel/Clerk/mail/DNS accounts, privileges, quotas, secrets and a named operator have not been verified.

## Required resolution

Provide authorized environments and named operational ownership through secure configuration. The implementation leaf creates reviewed Terraform and deployment definitions; costly provisioning or production actions require their applicable authorization. Record real read-back evidence without secrets.

## Evidence and closure

Attach the actual decision or read-back evidence, update the engineering contract and graph in a reviewed change, and verify the launcher accepts that exact resolution. Closing this issue alone does not resolve the gate.

Directly gates: R1-REL-002-A.
