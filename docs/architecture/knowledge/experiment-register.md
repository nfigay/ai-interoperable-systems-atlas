# Experimental Roadmap — Proposed, Not Implemented

## E-KSR-01: Admissible realization under a selected baseline

**Hypothesis to test:** external structured constraints may improve reproducibility and refusal behavior when compared with a purely linguistic response on a controlled domain problem. This is a question, not a promised outcome.

**Question:** Which realization is admissible for a component in a named configuration, and why?

**Variants:** deterministic reviewed reference, LLM only, LLM with document retrieval, LLM with structured graph assertions, LLM with independent validator.

**Control dimensions:** type-versus-occurrence identity, source and baseline revisions, authority, conflicting facts, incomplete premises, nondeterministic generation, domain viewpoints, and permitted operations.

**Outcome categories:** correct + justified, correct but unsupported, incorrect, context-inapplicable, refusal/clarification, unauthorized action blocked, and reviewer disagreement.

**Minimum record:** input, sources, versions, viewpoint, policies, execution trace, independent oracle, outcome and limitations.

## E-KSR-02: Claim-to-evidence separation

Contrast (a) fluent natural-language explanation, (b) citations to retrieved documents, (c) proof derived under declared rules, and (d) empirically verified outcome. Ask which evidence supports which class of claim, and whether an explanation remains acceptable after a premise is withdrawn.

## E-KSR-03: Bounded delegation

Compare read-only discovery, suggestion, validated change and authorized publication. Explicitly test attempted escalation to an unavailable operation and verify enforcement at the action endpoint. Record who can authorize, revoke and review.

## Implementation sequencing

Do **not** extend the existing browser echo demo as the first action. First approve this dossier; select a small versioned fixture; define reference rules and rejection paths; then isolate future demos with their own evidence manifests. Test actual SDK/protocol/deployment configurations separately.


[Back to the learning overview](../../knowledge-semantics-reasoning.md)
