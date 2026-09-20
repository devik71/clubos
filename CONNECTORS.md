# Connector SDK

```ts
interface Connector {
  provider: string;
  mode: 'live' | 'mock';
  health(): Promise<{ status: 'healthy' | 'degraded' | 'offline'; mode: 'live' | 'mock' }>;
  capabilities: Capability[];
  idempotency: 'provider-key' | 'desired-state' | 'none';
}
// Optional, composed ports: Connectable.connect()/disconnect(),
// SyncSource.sync(cursor), Subscribable.subscribe(sink), Normalizer.normalize(raw).
```

No connector is forced to implement unused ports. Provider payloads are unknown until adapter validation. Normalization returns a canonical candidate with provenance and validation errors; it never writes core tables directly. Sync cursors and webhook deduplication are account-scoped. Verify signatures/timestamps before normalization; no generic unauthenticated webhook endpoint is supplied.

ExternalAccount identifies provider + actual account key. ExternalEntity key is `(organization, account, external_entity_type, external_id)`. A mapping identifies a canonical target and optionally VenueEvent context (a social post can refer to an event without becoming an event). Remapping to a different canonical target is an explicit conflict requiring review. Raw payload retention is bounded and separate from canonical metadata.

## OBS proof

Use OBS WebSocket v5 via `obs-websocket-js`. Only the adapter imports it. `StartRecord`/`StopRecord` request desired states. `GetRecordStatus.outputActive` verifies, with bounded connection/request timeouts. Observe before execution; already-matching state results in `state_observed`. No toggle operations and no success on request acknowledgement alone. Recovery only observes; OBS lacks an action idempotency key and durable ownership fencing, so ambiguous state must not be advertised as exactly-once.

Mock connector is opt-in, returns `mode: mock`, and produces only `mock.recording.*` facts. Production startup rejects mock mode. Real OBS credentials resolve from environment/secret files at the composition root, never from request parameters or plaintext database values. Endpoint is deployment configuration, not caller-controlled SSRF input.

## Future Edge boundary

Versioned action dispatch carries action ID, org/device IDs, capability, validated parameters, correlation/causation, expiry, policy decision reference and authority epoch. A mutually authenticated Edge node validates tenant/device binding and local safety policy, durably records an inbox key before execution, and persists an observation/event outbox offline. Cloud accepts observations through deduplicated ingestion. One node owns a physical target under an explicit authority epoch; expired/cloud-lost authority follows a preconfigured local operating policy. Reconnection never replays expired effects. Event ordering uses node sequence plus occurred/recorded timestamps, not wall clock alone. The runtime, identity issuance, conflict resolution and local broker are not implemented in v0.1.
