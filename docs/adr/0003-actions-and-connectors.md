# ADR 0003: Separate requested Actions, capabilities and provider adapters

Status: accepted.

Decision: all infrastructure effects pass durable Action → permission/policy → canonical capability → connector → independent observed verification. Registry binds tenant/device/capability. Execution acknowledgement is not success. Uncertain effects are observation-only on recovery. No blind retry after dispatch. Approval belongs to immutable request/revision; execution rechecks policy.

Consequences: OBS is one adapter, not a domain dependency. External identities are mapped by provider account; schemas and credentials remain outside canonical models. Desired-state commands reduce duplicate effects but cannot prove physical ownership after all network failures. Mock evidence has a distinct mode and event namespace.
