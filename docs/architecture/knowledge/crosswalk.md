# Crosswalk — existing Atlas resources, manuscript and new modules

| New module | Book grounding (English translation) | Existing Atlas content | Main editorial action |
|---|---|---|---|
| A — Models, Worlds, Meaning | Ch. 1–3, 6, 9: ontological statuses, situated decomposition, translation | `roles-and-invocation.md` (MCP does not ensure semantics); configuration and part/usage explorer | Add bidirectional conceptual link; distinguish cross-model mediation from identifier matching |
| B — LLM Learning and Inference | Ch. 7: language fluency and commitment to reality | `llm-integration.md` (APIs vs MCP); `atlas-demonstrator-position.md` (no inference) | Clarify learning vs runtime; avoid anthropomorphic universal claims; attach evaluation questions |
| C — RAG, Ontologies, Graphs | Ch. 4–6, 9: formalization, assertions, translation | `adoption-and-limits.md`, `roles-and-invocation.md` | Add OWL / SHACL / provenance and baseline caveats; not tool discovery duplicates |
| D — Trust, Reasoning, Fallacies | Ch. 1, 5, 7–8: model/reality confusions, responsibility | `agents-and-evidence.md` | Define claim classes, independent oracles, calibration, fallacy falsifiers; keep article-specific positions attributed |
| E — Harness, Agency, Delegation | Ch. 8–9: responsibility and mediated authority | `agents-and-evidence.md`, `deployment-patterns.md`, `llm-integration.md` | Link roles to delegated powers and enforcement; do not confuse Host with an agent |
| F — Experiments and Evidence | Ch. 2–3, 6–8: viewpoints, configuration, traceability | `atlas-demonstrator-position.md`, version comparison | Evidence manifest and independent validation; new studies remain *proposed* |

## LinkedIn corpus cross-references (editorial, not independent technical verification)
- **Authority, Responsibility, Accountability, and Verification**: modules D and E (delegation and reproducible verification).
- **Neither Vibe Coding Nor Spec-Driven Development**: D, F (how engineering claims are checked).
- **Habiter Babel à l’ère des LLMs**: A, B, D (knowledge, the world, critique of the oracle).
- **Beyond BPMN Diagrams**: A, C (process representation vs operational semantics).
- **PLM Interoperability: ASD SSC Radar Chart**: A, F (standards and situated interoperability).
- **Beyond Visuals: ArchiCG**: A, C (translation and multi-view modeling).
- **Ten Years of Writing...**: entry page (historical continuity).
- **ArchiMate Interoperability...**: A, C (linked data and modeling commitments).

## Cross-link strategy
- From MCP `llm-integration.md` → B and E: inferencing providers are distinct from context assembly and delegated action.
- From MCP `agents-and-evidence.md` → E and D: autonomy requires evidence; accountability is not an agent property inferred from branding.
- From MCP `adoption-and-limits.md` → A and C: tool metadata never establishes equivalence of domain concepts.
- From MCP `atlas-demonstrator-position.md` → F: the browser echo trace proves MCP exchange, not semantic correctness, LLM reasoning, network interoperability or an agent.
- From KSR F → MCP `protocol-evolution.md`: SDK release, wire protocol revision and test evidence must be separately documented.

**Integration warning:** published source is accessible in a packaging copy but the live navigation/router has not been audited. These are link *intentions*, not verified relative URLs.


[Back to the learning overview](../../knowledge-semantics-reasoning.md)
