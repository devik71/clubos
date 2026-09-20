# Actions, capabilities and authority

Capability IDs are stable vendor-free names. v0.1 implements `media.start_recording` and `media.stop_recording`; events.read/update and tasks.create/assign are reserved module capabilities, not executable placeholders. Inventory, finance, communication, publishing and lighting are future capabilities with their own validation and policies.

```ts
interface Capability {
  id: string;
  parameters: ZodSchema;
  execute(input: ExecutionInput): Promise<ExecutionReceipt>;
  verify(input: ExecutionInput): Promise<Verification>;
}
type Verification = {
  matched: boolean; mode: 'live' | 'mock'; observed_at: string;
  state: Record<string, unknown>; evidence: Record<string, unknown>;
};
```

Registry binds `(organization, device, capability)` to an implementation. Callers provide the device's canonical ID and capability, not OBS host names. Parameters include VenueEvent/session context; validation verifies their tenant and relationship. Unknown capability/binding fails closed. `execute` receipts do not imply success; `verify` must independently read state.

## Small state machine

`requested → awaiting_approval | approved | failed | cancelled`

`awaiting_approval → approved | failed | cancelled`

`approved → executing | failed | cancelled`

`executing → verification_pending → succeeded | failed`

Executing actions cannot be cancelled as though their effects were undone. Cancellation is intent prevention, never physical compensation. Uncertain verification remains pending, with a bounded recovery observation before a failed audit and explicit operator review. Reconciliation must preserve uncertainty in failure evidence.

Each action stores immutable request inputs, actor, correlation/causation, idempotency key, schedule revision and approval identity. A duplicate key with different request content is a conflict. Permission → policy → preconditions → execute → verify → atomic success fact and projection. Failures persist `action.failed` including safe error code/stage; no raw credential-bearing error messages.

## Permission model

An authenticated Actor has a tenant and coarse role (`operator`, `admin`, `service`, `agent`). Grants scope capability and optional device to autonomy L0–L4. Explicit deny overrides. No matching grant denies. L0 denies; L1 recommends but cannot submit executable work; L2 awaits human approval; L3 runs within policy; L4 supports autonomous operation within the same constraints. v0.1 policies require an active device, matching operational context, unexpired schedule, and exclusive recording ownership. Approval requires an admin human and is rechecked against the current request; it never grants a missing capability. Every evaluation and approval is auditable. No wildcard superuser execution bypass.
