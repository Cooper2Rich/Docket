# Organize the monolith by deep domain modules

Status: accepted

Docket will organize Release 1 around deep `identity-access`, `schools`, `tournaments`, `registration`, `competition`, `publication`, `communications`, `governance`, and `workflows` modules behind deliberate public interfaces. Applications may compose those interfaces, every authoritative table belongs to exactly one module, cross-module workflows use durable orchestrators, and generic `shared`, `common`, or `utils` packages are prohibited because they obscure ownership and encourage implementation coupling.

## Consequences

The `competition` package initially keeps scheduling, Judge Pool, assignment, Pairing, Ballot, standings, advancement, award, and result behavior as internal modules behind one Release 1 interface. An internal module becomes a package only when a real independent interface or adapter justifies the new seam. Nx and package exports must reject implementation imports, dependency cycles, domain logic in foundation packages, and cross-module table writes.
