---
status: accepted
---

# Govern Additional Registration Fields

Docket allows tournament-specific registration questions only through a versioned Registration Data Schema published before registration opens. This preserves useful tournament flexibility without allowing undocumented collection, surprise requirements, or sensitive information to leak into a minor's ordinary Entry record.

## Consequences

- The Tournament Registration Policy references one exact accepted Registration Data Schema version.
- A Tournament Director configures, accepts, and publishes the Schema and a human-readable field and purpose summary before registration opens.
- Each field declares a stable identifier, label, purpose, required or optional status, supported data type, runtime validation, authorized audience, retention or disposition rule, and public-visibility classification.
- The first slice requires every additional field to be restricted and retains the public Entry boundary of display name, School, and event.
- Docket rejects purposeless fields, absent retention rules, executable validation, and access broader than the declared purpose requires.
- After registration opens, a Director may remove a field, stop collecting it, or make it optional.
- No post-opening revision may add a field, make it required, tighten validation, broaden access, lengthen retention, make it public, or invalidate an Entry that was already complete.
- First-round Pairing Publication ends Registration Data Schema revision authority.
- Each stored response references the Schema version under which the School supplied it.
- Medical information and accommodation details are prohibited from ordinary additional fields and must use a separate restricted Accommodation Request workflow.
- The future TypeScript UI renders and submits the same declarative backend contract.
- Complete-request access and minimized operational disclosure are governed by ADR 0025.
