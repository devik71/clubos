# ADR 0001: Modular monolith, PostgreSQL, identifiers

Status: accepted.

Context: an empty repository must support many independent venue domains without operational overhead.

Decision: one TypeScript monolith with module boundaries, REST, Next.js, PostgreSQL canonical state and parameterized SQL via pg. Keep core contracts/modules in one package until separate consumers exist. UUIDv7 generated in application code allows offline identity allocation and useful index locality. Store UTC instants and Venue timezone; IDs are not causal clocks.

Consequences: explicit migrations require SQL review; transactions remain simple. Service extraction can follow real scaling/security needs. No ORM-generated duplicate schema, microservices or broker infrastructure. DomainEvent log supplements mutable state; no full event sourcing or replay requirement for current-state correctness.
