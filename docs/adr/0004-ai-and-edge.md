# ADR 0004: Optional AI, future local Edge authority

Status: accepted.

Decision: no LLM dependency in runtime. ContextBuilder returns a bounded authorized canonical package and history; future AI can recommend or request Actions through normal policy. Versioned Edge commands/observations use durable IDs, correlation, expiry, deduplication and device authority epochs. Physical operations eventually run under a local authority during cloud loss.

Consequences: v0.1 is a single-authority monolith; it does not claim offline physical operation yet. Edge runtime and cross-node fencing remain an explicit next milestone. Agents cannot access credentials or bypass deterministic policy.
