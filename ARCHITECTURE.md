# Architecture

## Assessment and scope

The specification describes an operational platform, not a database centered entirely on shows. Independent people, venues, assets, and devices are tenant-owned; VenueEvent relates operational work. v0.1 implements one physical workflow and small canonical tables, not all business modules.

Use a TypeScript modular monolith: `apps/api` (REST and worker entry points), `apps/web` (Next.js read view), `packages/core/src` (domain services, actions, capabilities, automation, connectors, imports, context, observability), `packages/database` (explicit SQL migrations and transaction helpers). Contracts live inside core until separate consumers justify publishing a package. Edge has a documented wire boundary, not an empty application.

PostgreSQL + `pg` and reviewed parameterized SQL are the query layer. SQL makes tenant composite foreign keys, row locks, constraints, and append-only protections explicit; introducing an ORM as well would duplicate the schema. Zod validates external input. REST provides inspectable boundaries. Docker Compose supplies PostgreSQL and application services. Embedded PostgreSQL tests supplement real PostgreSQL integration tests.

## Ambiguities resolved

* `doors` is a planned/actual timestamp pair; sessions may also describe a doors interval. v0.1 schedules against session planned start; other anchors use the same discriminated contract but are rejected until supported.
* Exactly-once external effects cannot be guaranteed across PostgreSQL and OBS. Durable deduplication prevents repeated requests locally. Uncertain execution is reconciled by observation, never blindly retried. OBS start/stop are desired-state operations, not toggle commands.
* Changing a session invalidates pending actions from the previous schedule revision. Executing/uncertain work is not silently undone. A schedule fires at most once successfully unless explicitly rearmed; rescheduling after success never starts another recording.
* Starting an already active recorder verifies desired state but cannot establish ownership of the recording. It emits `recording.state_observed`, not an invented `recording.started` transition. v0.1 allows one operational owner per device; conflicts fail preconditions.
* Device observation is time-bounded evidence, not permanent truth. API state includes observed time, mode, and freshness. Mock state cannot assert physical state.
* An L2 approval is scoped to an immutable action and schedule revision. Permission, policy, and preconditions are checked again immediately before execution.
* L1 recommendations do not execute; L2 prepares; L3 executes constrained actions; L4 supports autonomous processes but does not bypass safety policy.
* Time/condition/domain-event trigger and workflow contracts are designed; only a relative time → action → verify workflow is executed in the first slice. Unsupported workflows fail validation rather than silently doing nothing.

## Boundaries

| Module | Owns | May depend on |
|---|---|---|
| Operations | VenueEvent, EventSession, Task, associations | database, event publisher |
| Identity | Organization, actors and grants | database |
| Equipment | Asset, Device, observations | database, event publisher |
| Actions | lifecycle, audit, policy, execution | capability interfaces, database |
| Automation | relative anchors, revisions, durable dispatch | action request service, domain state |
| Integrations | provider mapping, connector registration | canonical contracts only |
| OBS adapter | vendor client and translation | capability/connector contracts |
| Knowledge/import | bounded context, staged records | canonical services |

The composition root registers providers. No domain or scheduler imports OBS. Connectors never choose permissions or mark an Action succeeded. Action execution owns verification and atomic persistence of observation, terminal status, and event.

## Reliability

State mutations and event inserts commit in the same database transaction. The immutable log is also the outbox; mutable delivery rows are separate. Each subscriber has independent delivery state and a unique `(subscriber, domain_event_id)` receipt. Delivery is at least once; a transactional handler commits its database effects with acknowledgement. External effects must enqueue Actions, never run inside bus handlers. Retry errors retain attempt counts, next retry time, and terminal failure visibility. No Kafka or Redis.

The scheduler locks schedules and their anchor sessions, recomputes due times from canonical state, and inserts uniquely keyed Actions. Execution commits `executing` before contacting a provider. A per-device database lock serializes local executors. Crashed executions become `verification_pending`; recovery observes only. A failed observation leaves an explicit uncertain result requiring operator review. Never claim distributed exactly-once or fencing of an OBS server after a network partition. v0.1 is a single authority installation; multi-node physical control requires Edge ownership/fencing first.

## Invariants and enforcement

1. Provider schemas stay in adapters/external mappings: canonical contracts and dependency test.
2. DomainEvents describe facts: taxonomy, runtime envelope validation.
3. Actions request effects: separate table/type and lifecycle guards.
4. Infrastructure access passes capability and permission/policy: executor is the only adapter caller in application code.
5. Side effects use idempotency keys and desired-state reconciliation; uncertain effects are not automatically replayed.
6. Successful effects require observed verification; failed/unavailable verification cannot succeed.
7. Agents never receive secrets: secret references and composition-root resolution.
8. Future local operation survives cloud/LLM outages: Edge authority contract; no LLM dependency now.
9. History is append-only: database triggers reject UPDATE/DELETE/TRUNCATE; runtime role lacks mutation grants.
10. Imports retain malformed/ambiguous rows and errors; explicit reviewed mappings.
11. VenueEvent and DomainEvent names remain distinct throughout code.
12. Asynchronous requests carry correlation and causation IDs; action policy decisions and failures are facts.

## Architectural self-review before implementation

OBS coupling is confined to its adapter and composition root. Scheduling uses a capability name and device ID. Generic metadata cannot replace canonical typed fields. Actions and facts have separate envelopes. Duplicate execution is constrained locally, but external atomicity is impossible; reconciliation is explicit. Schedule revisions invalidate unexecuted actions under the same locks used by dispatch. Every request retains actor, policy evidence, correlation, causation, schedule revision, and verification. AI is absent from runtime dependencies. Edge can consume the same action contracts with an authority lease and durable inbox. Full workflow interpretation, general policy language, additional packages, and broker infrastructure are deferred because the slice has no consumer for them.

Sources: [PostgreSQL locking](https://www.postgresql.org/docs/current/sql-select.html), [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [OBS protocol](https://github.com/obsproject/obs-websocket/blob/master/docs/generated/protocol.md).
