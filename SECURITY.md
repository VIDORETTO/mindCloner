# Security Policy

## Reporting a vulnerability

If you identify a security issue, do not open a public issue.

Send the report privately with:

- Affected component(s)
- Reproduction steps
- Expected impact
- Suggested mitigation (if available)

Use this repository contact channel and include "Security" in the title.

## Response targets

- Initial triage: up to 3 business days
- Confirmation and action plan: up to 7 business days
- Fix timeline: based on severity and exploitability

## Scope

Priority areas for this project:

- Encryption and key handling (`MINDCLONE_ENCRYPTION_KEY`)
- Local storage safety (backup/rollback/recovery)
- Consent and crisis-protocol behavior
- Plugin loading and CLI event hooks
