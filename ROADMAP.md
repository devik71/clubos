# Small testable milestones

For each milestone: plan → implement → test → review → document evidence. Status is updated with actual results, not inferred from file presence.

1. **Architecture**: inspect repository, resolve assumptions, document contracts/schema/ADRs, review invariants before code. Acceptance: no vendor dependency in canonical models, explicit crash/reschedule behavior. Architecture draft complete.
2. **Persistence and contracts**: workspace, SQL schema, transaction helper, runtime validation, append-only log and external identity map. Acceptance: migration, tenant foreign keys, append-only failure and duplicate/conflicting ingestion tests.
3. **Actions and connectors**: grants, small lifecycle, scoped capability registry, explicit OBS/mock adapters and recovery observation. Acceptance: deny/L1/L2/L3/L4, failed verification never succeeds, duplicate request conflicts, audited failure.
4. **Scheduler and vertical slice**: durable relative schedule, revision reconciliation, timeline/projection and API/Next view. Acceptance: organization → verified recording; moving session cancels stale work; restart persistence; late deadline and recording ownership tests.
5. **Extension seams and operations**: bus delivery, import staging/dry run/idempotency, bounded ContextBuilder, health/logging, runbook. Acceptance: independent subscribers/retry, malformed rows retained, dry run no canonical mutations, bounded tenant context.
6. **Handoff review**: typecheck, unit/integration tests, Next production build; review docs against implemented behavior. Real OBS and actual PostgreSQL concurrency checks are separate from mock/embedded tests; report unavailable checks explicitly.

After v0.1: production auth and deployment hardening, Edge authority runtime, workflow run persistence, document/rider ingestion, deterministic inventory then additional integrations. No AI, finance, CV, full RAG or publishing pipeline in this bootstrap.
