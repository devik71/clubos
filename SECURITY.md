# Security boundary

Default development binding is localhost. REST requires a bearer token configured by the operator and maps it to a fixed tenant/actor server-side. Caller-supplied organization/actor headers never grant authority. Bootstrap is a local CLI, not a public tenant-creation endpoint. This is a development auth adapter; production requires validated OIDC issuer/audience, membership resolution, token rotation, TLS and deployment review.

Every query includes organization scope; composite foreign keys prevent cross-tenant relationships. Tenant tables have RLS using transaction-local `clubos.organization_id`. Runtime deployment uses a non-owner, non-BYPASSRLS role; migration credentials are separate. Never expose the database directly to agents. Tests must exercise wrong-tenant references and runtime-role RLS in PostgreSQL. Superusers/database owners can alter schema and bypass controls; append-only is an application/runtime-role invariant, not protection against database administrators.

Grant decisions combine actor, capability, device resource, context and autonomy. Human approval records a named authorized human, never a client boolean. Inputs are validated with bounded sizes; API applies body limits and per-client rate limiting (single-process development implementation). Future webhooks need provider-specific signatures, replay windows and account scoping before ingest.

Secrets are referenced, not stored in canonical JSON or external mapping metadata. OBS password is supplied via environment or mounted secret file. `.env` is ignored; `.env.example` contains no operational credentials. Production should use a secret manager. Logs contain IDs, stages and safe error codes, not raw provider payloads, tokens, document text or credentials. API errors do not serialize database internals.

Idempotency conflicts return 409; permission denials 403; invalid data 400. Failed privileged effects always create audit facts. Agents use exactly the same Action and policy path; no direct infrastructure credential or arbitrary connector invocation endpoint exists.

Documents/import sources are untrusted data, not executable instructions. ContextBuilder enforces tenant scope, authorization and size limits; embeddings are future derived indexes, never canonical truth.
