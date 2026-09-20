# ClubOS v0.1

ClubOS is a modular operational core for venues. PostgreSQL owns structured state; immutable DomainEvents record facts; Actions request effects through capabilities and policy. No LLM is needed.

## Repository assessment

The starting directory was empty (no Git repository, application, or local instructions). Node/npm are available in the development environment; Docker is absent. This is a greenfield bootstrap, not a migration.

## Reading order

[Architecture](ARCHITECTURE.md), [domain model](DOMAIN_MODEL.md), [events](EVENT_TAXONOMY.md), [capabilities](CAPABILITIES.md), [automation](AUTOMATION.md), [connectors](CONNECTORS.md), [security](SECURITY.md), [milestones](ROADMAP.md), and [decisions](docs/adr/README.md).

## Intended first slice

Create organization → venue → VenueEvent → artist-set EventSession → relative recording schedule → durable Action → authorization → capability resolution → connector execution → observed verification → immutable fact → timeline and recording projection. Moving a session reconciles pending work.

Implementation and tested run instructions are recorded below as milestones complete. This bootstrap is local development software, not a production deployment.
