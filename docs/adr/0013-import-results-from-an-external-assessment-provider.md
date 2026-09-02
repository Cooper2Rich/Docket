---
status: accepted
---

# Import results from an external assessment provider

The initial Docket backend will not host the Judge testing experience. A third-party Assessment Provider will administer Judge Qualification Assessments and send results to Docket. Docket will remain the system of record for attempts, qualification status, tiers, validity, tournament-local grants, and assignment eligibility.

## Consequences

- Docket must associate every received result with one Docket Judge, event, assessment version, and authorized attempt before using it.
- Docket creates a single-use Assessment Attempt ID before the Judge begins the provider-hosted assessment.
- An authenticated Judge must initiate their own assessment from Docket. The provider returns its stable account identifier, and the first verified result creates a one-to-one link for that provider and Judge.
- Names and email addresses may warn about a mismatch but cannot establish or change the identity link.
- Provider-originated attempts and conflicting identities are blocked from qualification processing. A Platform Administrator may resolve them only through an attributed, evidence-backed Assessment Identity Review.
- Link corrections are versioned and preserve prior decisions. Existing attempts, results, qualifications, and assignment evidence are never silently moved between Judges.
- The provider returns a signed, retryable webhook containing the Docket attempt, Judge, event, and assessment-version identifiers; a unique provider result ID; completion time; raw score; Critical Competency Item results; Judging Profile responses; and submitted answers, but never its answer key.
- Docket rejects invalid signatures and identifier or version mismatches. Duplicate delivery of the same result is idempotent, while conflicting reuse of an attempt is rejected.
- The provider administers the test, but Docket enforces qualification validity, retake and test-out limits, privacy, audit, and tournament-assignment rules.
- Docket calculates the authoritative result and tier from its versioned scoring bands and critical-item policy; a provider-supplied tier or ordinary manual score entry cannot create a qualification.
- If webhook delivery fails, the provider retries automatically. An authorized Platform Administrator may alternatively upload an attributed provider-signed result file containing the same contract and subject to the same verification and idempotency checks.
- An attempt remains Pending Verification and supplies no new qualification, tier, or assignment eligibility until a provider result passes every check. A Tournament Tier Grant cannot bypass assessment completion.
- Tournament staff may reassign another eligible Judge while a result is pending. A later verified result applies prospectively, and a separate existing valid qualification remains unaffected.
- Docket must preserve the external provider and its result identifier with the immutable attempt record.
- An unlinked or unverified provider result cannot create or change an Event Qualification or Temporary Debate Qualification.
- Provider replacement or future first-party testing must not require changing the core Judge qualification model.
- Provider payload, submitted answers, detailed score and Critical Competency evidence, and integrity evidence are purgeable under ADR 0028 rather than permanent solely because they arrived from the provider.
