# Reviewable experimental protocol (future, not executed)

## KSR-01 — Controlled configuration admissibility
**Fixture:** three component definitions; two usages; two baselines; two mutually incompatible source viewpoints; at least one obsolete source and one unresolved identity mapping. Define the entities and relations precisely *before* generating AI prompts. Use synthetic data; do not imply that the fixture is an actual industrial record.

**Ground truth:** rule set with applicable version/authority, expert-reviewed expected output, explicit `insufficient evidence` and `not authorized` states. Permit qualified disagreement where context is inherently contested; do not force an artificial oracle.

**Conditions:** reference rules only; LLM-only; LLM + versioned retrieved documents; LLM + structured graph; LLM proposal + independent symbolic checker. Keep information access as comparable as possible and document unavoidable differences.

**Adversarial cases:** obsolete valid-looking data, conflicting source authority, type/occurrence conflation, shifted baseline, injected tool description, missing mandatory premise, non-reversible write request.

**Metrics:** validity and applicability, refusal accuracy, unsupported assertion rate, provenance fidelity, proof checkability, tool permission enforcement, trace completeness, latency and operating cost. Record sample sizes and uncertainty; avoid claiming superiority from illustrative single runs.

## KSR-02 — Explanation versus evidence
For each answer, identify whether it is a narrative, a source-supported claim, a formal derivation or an observed action. Remove a critical premise; ask whether the proof fails, the answer abstains or the narrative merely changes. Keep explicit model and index revisions.

## KSR-03 — Controlled delegation
Progress from discovery to proposal, staging, approval and publish. Include a policy denial, attempted prompt-level override and revocation after authorization but before execution. Verify enforcement at service boundary and observable final state.

## Evidence manifest (minimum)
`experiment_id`, `fixture_digest`, `baseline_id`, `viewpoint`, `source_digest`, `model_revision`, `harness_revision`, `protocol_revision`, `sdk_revision`, `transport`, `tool_schema_digest`, `delegation_policy_revision`, `calls_and_results`, `human_decisions`, `validator_result`, `outcome`, `limitations`.

**Important:** source manifest for LLM/RAG tests is not the same as an MCP conformance test. The latter must explicitly capture lifecycle/discovery behavior and wire-level protocol features for each named version.


[Back to the learning overview](../../knowledge-semantics-reasoning.md)
