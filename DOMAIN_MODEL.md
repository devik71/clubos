# Canonical model

UUIDv7 identifiers are generated in application code (including future offline nodes); database columns use `uuid`. Ordering is approximate creation locality, never a substitute for explicit timestamps or causal ordering. All instants are `timestamptz` UTC; Venue stores IANA timezone for display and human input. API requires timestamps with explicit offset.

Mutable tenant entities have `id`, `organization_id`, `created_at`, `updated_at`, nullable `created_by`, `status`, JSONB `metadata`, integer optimistic `version`. Organization is the tenant root and has no redundant organization ID. Join tables carry tenant-scoped composite foreign keys. External provenance belongs to ExternalAccount/ExternalEntity rather than repeated `source/external_id` fields. Historical records use immutable timestamps, not misleading updated-at/version fields. Actor identity is distinct from Person (a performer need not log in).

## Initial tables

* organizations: name, timezone.
* venues: organization, name, timezone.
* people: organization, display name; private contact fields deferred.
* venue_events: organization, venue, title, planned/actual start/end, planned/actual doors, lifecycle status.
* event_sessions: organization, VenueEvent, kind (open string for custom types), title, planned/actual start/end.
* tasks: organization, optional VenueEvent/session, title, optional Person assignee.
* assets: organization, optional venue, name, category.
* devices: organization, asset, logical name, configured capability binding; no vendor credentials.
* documents: organization, title, content reference and media type, optional VenueEvent. Object storage/embedding indexes are later adapters.
* event_assets: tenant-safe VenueEvent ↔ Asset links.
* external_accounts: organization, provider, account key, optional secret reference; unique per provider account.
* external_entities: organization, account, provider entity type/id, canonical type/id, optional operational VenueEvent context, metadata, last sync, payload hash. Uniqueness includes account to avoid cross-account ID collisions. Canonical targets validated through a typed resolver; a generic UUID alone is not a foreign key.
* domain_events: immutable envelope below; optional VenueEvent context indexes timeline facts without making VenueEvent universal root.
* event_deliveries: independent consumer retries/receipts.
* actors, capability_grants: human/service/agent identity, coarse role plus exact capability, optional device resource, autonomy level; deny overrides allow.
* actions: actor, capability, device, parameters, lifecycle, idempotency key/request fingerprint, approval, policy/verification evidence, correlation, causation, schedule/revision, timestamps.
* automations: declarative trigger, conditions, steps, status.
* schedules: automation, session anchor, offset seconds, due time, revision, fired Action ID; pending/review/completed status.
* device_observations: current observed recording state, mock/live, observed_at, evidence, operational owner.
* import_jobs/import_records: source namespace, mapping snapshot/hash, dry-run mode, raw row, normalized row, errors, stable source record key, result target; raw malformed rows retained.

Cross-tenant references use `(organization_id, id)` unique keys and foreign keys, including joins. State transitions update version and timestamps explicitly. Session end must exceed start; event end must exceed start; null actual times represent unknown. Planned times never become actual times automatically.

## Future extensions (not empty CRUD modules)

OrganizationContact links a Person to an external organization. Artist is an independent identity; ArtistAppearance joins Artist to VenueEvent/session and booking details. Project groups Tasks. Incident and Decision associate actors, evidence, and optional operational context. Supplier, Product, InventoryItem, StockMovement and PurchaseOrder form purchasing/inventory boundaries; stock movements are immutable ledger facts. MediaAsset links storage references, capture provenance and sessions. Workflow will version definitions separately from Automation triggers and persist runs/steps. Finance and audience summaries plug into ContextBuilder under permissions and budgets.
