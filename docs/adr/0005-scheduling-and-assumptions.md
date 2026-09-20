# ADR 0005: Relative scheduling, recording ownership, development scope

Status: accepted.

Decision: persist session anchor + offset, computed due time and revision. Lock schedules before session/action reconciliation. Rescheduling invalidates pending old revisions, never silently replays completed work. Executing/uncertain actions require review. Late tolerance defaults to 120 seconds; expired work is audited instead of executed. Each recording device has one operational owner. Already-active recording yields an observation fact, not a claimed start transition.

Assumptions: first slice uses a single session-start anchor, one action, and explicit verified completion; no recurring schedules or arbitrary expressions. Bootstrap identity is a local CLI; development API bearer credentials are server-configured. Mock mode is opt-in and prohibited for production. Rich workflow/import formats are contracts/staging extensions, not advertised integrations.

Consequences: users explicitly rearm failed/completed automations. Local single-device serialization does not replace future Edge fencing. Docker/real OBS may be unavailable in the development environment; tests must label simulation/embedded database evidence accurately.
