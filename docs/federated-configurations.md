# Federated Configuration Management

This view connects existing architectural objects: composition → baseline → occurrences and selections → resolver evaluation → documentary references and normative sources. The federated configuration registry is a **computed projection** of existing data, not a second repository to maintain.

## Usage

From any Atlas Markdown page, choose a composition in the explorer. Its inspector displays the exact baseline, context, specification revision, selected resources, externally governed references, and resolution justifications. Clicking an occurrence focuses its selection. Clicking a relationship reveals its type. “Linked baselines” supports reverse navigation from a reference. The Atlas Markdown document opens the page actually included by Vite.

## Demonstrated capability and limitations

| Capability | Design reference | Nature of reuse | Evidence in Atlas | Limitation |
|---|---|---|---|---|
| Selected requirements and capabilities | Eclipse Equinox p2, *Installable Units*, documented in `sources.json` | Educational adaptation | `evaluate()` and configuration resolution tests | Neither p2 language nor p2 engine |
| Separation of identity, authority, and native revision | STEP AP239/PLCS, AP242 (domain references, not verified clauses) | Inspiration, Atlas-specific creation | References and `pinned` rule in `createRegistry()` | No STEP conformance claimed |
| Content configuration and documentary references | OMG SPEM 2.0, normative page recorded in `sources.json` | Inspiration | Markdown reference under `atlas-git` and inspector links | No SPEM/EPF export |
| Provenance, observations, and validity | PROV-O / OWL-Time, links in `sources.json` | Temporal separation concepts | Displayed `assertedAt`, `observation`, `validFrom`, `validUntil` fields | No PROV or OWL-Time graph generated |
| Reference to externally versioned resources | OSLC Configuration Management | Inspiration only | `federatedReferences` and reverse navigation | No implemented OSLC service |

Components and their versions are explicitly fictitious. `source-doc` references are not accessible as files in this workspace: they are shown as external document identifiers, **not working links**. The Markdown Git reference is moving (`repository-local-current`) and is not presented as a reproducible baseline. `resolved` means only that expressed constraints are satisfied; actual behavior, immutable native identity, and deployment have not been verified.

## Validation

Run `npm test` and `npm run build`. The configuration tests check forward/reverse traversal, Markdown links, inconsistent selections, supposedly pinned references, and computed evaluation. No integration with PLM, SAT/SMT, remote systems, or production UI is claimed.
