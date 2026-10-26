# ADR-0001 — Maintain a source-first, model-friendly atlas

**Status:** Proposed
**Date:** 2026-10-26

## Context
Chat responses mix draft statements, citations, diagrams, and discussion. They are difficult to version, cite, correct, publish and reuse. Multiple architectural viewpoints are needed, with ArchiMate preferred for enterprise architecture but not imposed on scientific or formal-semantic representations.

## Decision proposed
Use Markdown as a human-maintainable entry format in Git, stable IDs and structured data for concepts/links, architecture model files alongside exports, and a statically generated navigable website. Maintain open evidence and explicit editorial statuses. Keep conversations as supporting research notes, not authoritative content.

## Alternatives
Single document/PDF; wiki-only; knowledge graph first; proprietary workspace/database; keep ChatGPT as source of truth.

## Consequences
**Positive:** portability, diff/review, low cost, cross-references, offline editing, multi-format publishing.
**Tradeoffs:** editorial discipline required, semantic consistency not automatic, Git learning curve, website not automatically an ontology, and publication/privacy workflows needed.

## Review trigger
Growing need for typed semantic queries, concurrent editorial workflows, or richer architecture model interchange.
