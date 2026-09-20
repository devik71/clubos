# Automation and relative scheduling

```ts
type Trigger =
  | { kind: 'time'; anchor: { entity_type: 'event_session'; entity_id: string;
      field: 'planned_start' }; offset_seconds: number; late_tolerance_seconds: number }
  | { kind: 'domain_event'; event_type: string; schema_version: number }
  | { kind: 'condition'; metric: string; operator: 'lt' | 'gt' | 'eq'; value: number };
type Step =
  | { kind: 'action'; capability: string; target_id: string; parameters: object }
  | { kind: 'wait'; seconds: number }
  | { kind: 'verify'; action_step: number };
```

Definitions are versioned and immutable once a run starts. Do not evaluate arbitrary expressions, JavaScript, SQL or LLM output. Conditions will use registered metric resolvers and edge/crossing semantics with debounce; unsupported metric/step/trigger combinations are rejected in v0.1. The first interpreter supports one time trigger, no extra conditions, and one action with mandatory executor verification. This is enough for the recording slice.

## Relative reconciliation

Schedule retains anchor identity, field, offset, computed due time, revision, and fired action ID. It is never just a hardcoded timestamp. Creating the slice uses offset `-300` and documented late tolerance `120` seconds. Dispatch locks the schedule, re-reads the session, computes due time, checks lateness and uniquely requests `schedule:<id>:<revision>`. The persisted requesting actor is reauthorized at execution time.

Session rescheduling locks affected schedules in stable ID order before the session, increments session version and schedule revision, recomputes due time, and cancels any old requested/approval-waiting/approved action with an audit fact. Execution locks the same schedule before action/precondition checks. A changed schedule cannot execute stale pending work. A successfully fired schedule stays completed when its anchor moves. Executing/verification-pending work moves the schedule to review; no implicit second effect. Deadlock/serialization failures are surfaced for safe transaction retry.

Restart: database schedules remain durable. Overdue within tolerance dispatch once; older work becomes review with an auditable missed-deadline fact. No silent catch-up recording hours later. A session moved into the past follows the same rule. Cancellation/failure does not automatically rearm; operator creates a new automation after review. Multi-action WAIT/NEXT runtime and recurring calendar/DST rules are deferred.
