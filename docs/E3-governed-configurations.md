# E3 — Provenance, Temporality, and Governed Configurations

**Status: P — Atlas architectural proposal, version 0.1.** Correspondence with a standard does not constitute a claim of normative conformance. The E3 demonstrator is a **limited declarative evaluator**, not a general-purpose solver or deployment tool.

## Engineering question

How can we distinguish concepts, their documentary representations, versioned realizations, candidate architectures, precise configurations, deployments, and observations, while justifying their relationships and evolution?

## Objects and identity

| Proposed Atlas object | Identity | Constraints and provenance |
|---|---|---|
| `Concept` | Stable URI + definition revision | The definition can evolve without changing concept identity; assertions are dated |
| `Assertion` | Stable ID + version | Subject, typed predicate, object, scope, N/S/E/P/U status, precise evidence |
| `Source` | `source_id` | Publisher, canonical URL, edition/revision, publication date, verification |
| `Realization` | Product ID + version + digest if available | Declared capabilities, requirements, limitations, artifacts |
| `ConfigurationSpecification` | ID + revision | Required capabilities, rules, environment context, permitted choices |
| `Resolution` | ID + immutable input references | Status: resolved / incompatible / indeterminate; explanation of constraints |
| `ResolvedConfiguration` | ID + immutable manifest + hash | Exact set of selected realizations; not yet test-validated |
| `Deployment` | Installation ID + observed revision | Actual environment, timestamp, and provenance |
| `Observation` | Trial ID + timestamp | Configuration actually tested, method, results, and uncertainties |

**Do not conflate** `publishedAt`, `updatedAt`, `observedAt`, `verifiedAt`, `validFrom`, `validUntil`, and `executedAt`. Unknown dates remain null. Applicability periods are governed assertions and may be disputed. For retroactive changes, record the effective date and the date of knowledge in Atlas separately (proposed bitemporal approach).

## Reuse decisions

| Origin | Reuse / derivation | Rationale and limitation |
|---|---|---|
| OMG SPEM 2.0, `MethodPlugin`, `MethodConfiguration` | **Conceptually reused for methods and processes; derived selection pattern** | Select a coherent subset and define a variability space; SPEM is not a software-component compatibility metamodel |
| Eclipse EPF | **Derived tooling pattern** | Method libraries, selection, adaptation, and publication; Atlas does not require EPF execution |
| Eclipse Equinox p2, Installable Units | **Requirements/capabilities/version model inspired by p2** | Separate metadata from artifacts and satisfy requirements in context; the E3 evaluator does not implement p2 |
| W3C PROV-O | **Vocabulary intended for reuse**: `prov:Entity`, `prov:Activity`, `prov:wasDerivedFrom`, `prov:wasGeneratedBy` | Interoperable traceability; mapping planned but not implemented here in RDF |
| W3C DCAT 3 / Dublin Core | **Targeted metadata reuse** | Resource identification, publisher, version, and date; software artifacts do not automatically become `dcat:Dataset` instances |
| W3C OWL-Time | **Targeted reuse of instant and interval concepts** | Temporal formalization; the consulted page is a Candidate Recommendation Draft, not a final Recommendation |
| Atlas E3 | **Original / P**: knowledge states, configuration categories, assertion governance, and validation interface | Needed to relate specification, realization, evidence, time, and decisions without claiming an invented standard |

## Relationships that must not be conflated

- `concept describedBy source` is not `realization implements specification`.
- `specification selects realization` is not `configuration deployedAs deployment`.
- `resolution satisfiedDeclaredConstraints` is not `configuration experimentallyValidated`.
- `source changed` triggers **targeted review**, never an automatic nonconformance assertion.
- Cytoscape `compound parent` remains a **view** property, not an ontological assertion.

## E3 resolution: formal scope

For specification `Q`, selected realizations `S`, context `E`, and knowledge state `T`:

- `provided(S)` is the union of constituents' **declared** capabilities.
- Checked constraints are `Q.requiredCapabilities ⊆ provided(S)` and `∀ c ∈ S, c.requires ⊆ provided(S)`.
- If a declared constraint is violated: `incompatible`.
- Otherwise, if required constraints remain unknown or unevaluated: `indeterminate`.
- Otherwise: `resolved` **within the declarative scope only**.

**Caution:** In this proof of concept, `resolved` is limited to the recorded constraint set. It does not establish effective API or MCP protocol compatibility, semantic behavior, security, or reproducibility. Claiming experimentally validated interoperability requires an observation linked to an immutable configuration.

## Supplied test cases

In `data/e3/configurations.json`, `*-demo` components are **fictitious** and refer to no actual product versions:

1. `case:resolved`: declared capabilities and requirements satisfied.
2. `case:incompatible`: fictitious client requiring unavailable `mcp-transport-v0`.
3. `case:indeterminate`: structural constraints satisfied, but behavioral and semantic conformance unknown.

`node scripts/e3-resolver.mjs` evaluates these cases. `node --test test/e3-resolver.test.mjs` checks basic consistency. No additional npm dependencies.

## Limitations and next decisions

- No automated source-change detection in this increment; `contentRevision` remains `null` when unverified. Later: Git commit SHA, version URI/ETag where reliable, canonical-content digest, and a list of affected assertions for review.
- No SAT/SMT solver: the tool checks a given selection without exploring alternatives.
- No computed immutable manifest, SHACL validation, or operational RDF mapping yet.
- Replacing demonstration data with actual realizations will require a sourced registry of versions/capabilities and compatibility tests.

## Governed sources

Known references, versions, and consultation dates are in `data/e3/sources.json`. Canonical sources:

- OMG SPEM 2.0: https://www.omg.org/spec/SPEM/2.0/
- Eclipse p2 IUs: https://github.com/eclipse-equinox/p2/blob/master/docs/Installable_Units.md
- W3C PROV-O: https://www.w3.org/TR/prov-o/
- W3C DCAT 3: https://www.w3.org/TR/vocab-dcat-3/
- W3C OWL-Time: https://www.w3.org/TR/owl-time/
