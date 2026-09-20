# DomainEvent contract and delivery

```ts
type DomainEvent = {
  id: string; type: string; occurred_at: string;
  organization_id: string;
  entity_type: string; entity_id: string;
  venue_event_id?: string;
  source: string; // core, connector identity, or edge node; never a secret
  actor: { id: string; kind: 'human' | 'service' | 'agent' };
  data: Record<string, unknown>;
  correlation_id: string; causation_id?: string;
  schema_version: number;
};
```

Database adds `recorded_at`, a monotonic local `position`, and an optional ingestion key. `occurred_at` is fact time from an accepted source; `recorded_at` is ingestion time. Neither UUID ordering nor occurrence timestamp establishes global causality. Clock skew is visible. Ingestion deduplication uses organization + source + key, compares payload fingerprint and rejects conflicting retries. Core events use action ID + transition as deterministic ingestion keys. Facts cannot be rewritten; corrections are new facts referencing previous IDs. Schema version is per event type; consumers must reject unsupported versions visibly.

| Fact | Meaning |
|---|---|
| organization.created / venue.created / event.created | Canonical object committed |
| session.created / session.rescheduled | Session created / planned times changed |
| automation.created | Relative recording automation accepted |
| action.requested | Durable requested effect recorded (not an execution command on the bus) |
| action.authorization_evaluated | Policy decision and rule evidence recorded |
| action.approved / action.cancelled / action.failed / action.succeeded | Action lifecycle fact |
| recording.started / recording.stopped | Live connector observed requested transition |
| recording.state_observed | Live recorder already met desired state or uncertain execution reconciled |
| mock.recording.started / mock.recording.stopped / mock.recording.state_observed | Simulated observations, explicitly nonphysical |

Future facts: event.confirmed, session.started/ended, task.created/completed, rider.received, doors.opened, inventory.low, camera.online/offline, incident.created, media.render.completed, media.publish.completed. Publishers add payload schemas when their owning domain is implemented.

`EventBus.publish(transaction, event)` persists atomically with state. `subscribe(name, types, handler)` registers an independent consumer. `drain()` creates/claims durable deliveries using row locks and dispatches bounded batches. Subscriber registration is explicit and stable across deployments. Replay is an operator action/new subscriber identity. Handler writes + delivery acknowledgement share a transaction; errors roll back and increment retries separately. Poison deliveries remain queryable after bounded retries. A future broker relays from this same committed outbox; broker acknowledgement never changes historical events.
