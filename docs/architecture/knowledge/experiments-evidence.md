# F — Architectural Experiments and Evidence

**Status:** proposed study protocol · **Not implemented:** future LLM/RAG/graph/symbolic variants.

## The central comparison

**Question:** *Which realization is admissible for component C in configuration baseline B, and why?*

The current Atlas has graph/configuration concepts and an embedded browser MCP echo demonstration. These support teaching about representations, traces and protocol exchanges. They do not yet support a controlled comparison of AI reasoning implementations. This module defines a staged future experiment rather than reporting results.

## Competing realizations

- **R0 — Deterministic reference:** a curated, versioned ruleset and expected output for carefully constructed cases; expert review handles contested semantics.
- **R1 — LLM only:** a fixed prompt and specified context snapshot.
- **R2 — LLM + document RAG:** same task plus retrieved documents with source/version tracking.
- **R3 — LLM + graph:** access to selected structured assertions, mappings and ontology commitments.
- **R4 — LLM + independent validator:** candidate answer checked by explicit constraints and, where possible, a deterministic executable rule.

R0 is not automatically an oracle of the real world. It is a task-specific reference, whose premises, policy and authority must be declared and challenged.

## Variables and controls

Hold the task, domain case and acceptance rubric constant when technically meaningful. Record differences in retrieval content and harness behavior rather than pretending implementations are equivalent. Include repetitions to characterize variability, and adversarial controls to reveal brittle assumptions.

| Case | Intent | Expected research observation |
|---|---|---|
| Correct baseline | Basic admissibility | Correct result with cited applicable constraints |
| Obsolete revision | Temporal validity | Recognition of applicability failure |
| Type/occurrence collision | Identity semantics | No false equivalence |
| Conflicting sources | Mediation | Conflict surfaced, not silently hidden |
| Missing permission | Delegation | No unauthorized write/action |
| Missing mandatory input | Epistemic humility | Clarification, abstention or safe escalation |
| Sound rule + false premise | Formal vs empirical validity | Inference qualified by premise status |
| Differing viewpoints | Plurality | Contextual answer, not forced single truth |

“Expected” describes the experiment's intended discrimination, not a prediction that every system will behave correctly.

## Evidence manifest per run

Use a machine-readable record eventually containing: experiment ID; timestamp; question text; role/viewpoint; scenario revision; baseline ID; data hashes; source and ontology versions; model/provider identifier; tokenizer/configuration when applicable; prompt and harness revision; network/SDK/protocol versions; retrieval candidates and scores; granted permissions; approvals; tool-call arguments and responses; validator version; reference answer/reviewer; outcome; failure taxonomy; reproducibility notes; data-use and privacy constraints.

The evidence must separate **generated reasoning text** from **observed tool calls** and **verified postconditions**. Logs of a correct JSON-RPC exchange prove that messages were exchanged under the tested conditions, not that a semantic mapping was right.

## Protocol-version matrix

MCP **protocol revision**, SDK **package version**, transport, application deployment and server implementation must be reported separately. For the published 2025-11-25 and 2026-07-28 protocol generations, do not presume compatibility merely because a single SDK claims to support both. Test the actual negotiated/configured behavior (including lifecycle/discovery and tool exchange where applicable) with captured traces. An embedded MessagePort transport also cannot establish browser-to-server HTTP behavior, authentication, or cross-origin viability.

## Deployment matrix

| Deployment | Demonstrates | Does not by itself demonstrate |
|---|---|---|
| GitHub Pages + two Workers + MessagePort | Browser execution, real local MCP exchanges | Persistent server, network auth, multi-user load |
| Browser + remote MCP HTTP server | Networked MCP, CORS/auth boundaries under test | General Internet deployment safety |
| Node.js Host + MCP server | Server-side policies, secrets and integrations | Browser-only feasibility |
| Hosted harness + external inference APIs | Tool/LLM orchestration with managed credentials | Model understanding or trustworthy decisions |
| Hybrid validator/knowledge service | Explicit checking across components | Semantic adequacy of all source assumptions |

GitHub Pages hosts static content; it does not run a persistent Node.js server. Browser restrictions include CORS, unavailable raw stdio processes, protected secrets, cross-site authentication and sometimes streaming constraints. Individual scenarios should state browser/vendor/runtime details instead of generalizing from one setup.

## Publication and negative findings

Each experiment page should publish **claim**, **configuration**, **observations**, **limits** and **next falsification test**. A failed case is useful evidence if reproducible and correctly scoped. No experiment certifies that a system “understands” without first defining what behavior that word designates. Qualitative expert adjudication is valid evidence of interpretation if its criteria and disagreements are documented.

## Review gate

Before enabling any real external operation, validate security, credentials, authorization, data governance and rollback. Before interpreting any outcome as semantic evidence, validate the relevant mapping, viewpoint and baseline. Before generalization, validate coverage and independence of the oracle.

**Sources:** proposed design informed by *Inhabiting Babel* chapters 3–9, editorial references on accountable AI engineering, existing Atlas architectural material and MCP protocol documentation. **No new behavior or test result is claimed by this file.**

---

## Continue the guided pathway

[Return to the learning overview](../../knowledge-semantics-reasoning.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — atlas demonstrator position](../mcp/atlas-demonstrator-position.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
