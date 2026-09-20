# ADR 0002: Append-only DomainEvent log as transactional outbox

Status: accepted.

Decision: state and immutable fact insert share a PostgreSQL transaction. Separate mutable subscriber delivery rows track acknowledgement/retry. Per-consumer delivery is at least once, with idempotent transactional handlers. Immutable history has UPDATE/DELETE/TRUNCATE rejection and restricted runtime grants. Tenant/source/ingestion key plus fingerprint detect duplicate or conflicting ingestion.

Consequences: PostgreSQL handles modest v0.1 load; workers use bounded batches and locks. A future broker consumes the outbox. There is no promise of global ordering or exactly-once external effects. Facts and commands remain distinct types and tables.
