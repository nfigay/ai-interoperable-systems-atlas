# C — RAG, Ontologies, Knowledge Graphs and Neuro-Symbolic Systems

**Status:** architecture comparison · **Evidence class:** technical synthesis + authorial critique.

## Four ways to contribute to an answer

A model's *parametric* competence originates partly in learned weights. Retrieval-augmented generation (RAG) selects external material to place in an inference context. Knowledge graphs store structured assertions and links, possibly with ontology-defined terms. Symbolic engines derive consequences or check constraints according to explicit semantics. These contributions are complementary and can also conflict.

Do not treat *source retrieval*, *assertion storage*, *semantic interpretation* and *proof* as synonyms.

## RAG: retrieval is not adjudication

A typical RAG system ingests sources, extracts text or structure, segments items, builds indexes, retrieves candidates, optionally reranks them, assembles a context window, and asks a model to answer. Index freshness, document validity, granularity, permissions and citation identity all matter. A high similarity score means neither that a source is authoritative nor that the statement applies to the user's configuration.

**Failure example:** a contract clause is retrieved from an obsolete contract while an active amendment is missed. The retrieval can be technically successful and the answer operationally wrong. A responsible RAG design records document version, effective date, jurisdiction, access rule, retrieval strategy and why the returned evidence applies.

## Ontologies: commitments, not an oracle

An ontology can provide explicit vocabulary, constraints and formal axioms, potentially enabling logical inference. It cannot, merely by existing, show that its conceptualization is the right one for every community. In *Inhabiting Babel*, chapter 4, an ontology is treated as situated formalization; chapter 5 warns that a knowledge graph holds assertions whose truth and interpretation require external attention. These are argued positions with substantial practical implications.

An ontology version or mapping should expose its authority, assumptions, coverage, intended use and migration policy. JSON Schema validation, OWL reasoning and SHACL constraints do different jobs: structural validation, logical entailment, and graph-shape/constraint checking, respectively. Passing one is not passing the others.

## Graphs: assertion provenance and contradiction

For each graph assertion, record its *subject identity*, predicate meaning, source, asserted/observed/inferred status, time scope, context and responsible maintainer. Two statements can be logically contradictory in one frame but compatible when their time intervals, jurisdictions or viewpoints differ. Do not “resolve” every conflict by choosing the newest record: a newer source may apply to a different baseline.

## Neuro-symbolic compositions

There is no single neuro-symbolic architecture. Useful patterns include:

1. **LLM proposes; solver checks:** model extracts a candidate configuration; rules verify admissibility.
2. **Graph constrains retrieval:** a formal entity/context filter narrows document search before generation.
3. **Symbolic facts augment context:** a reasoner produces traceable entailments included with the prompt.
4. **LLM assists model maintenance:** proposes mappings or constraints; an authorized expert validates and versions them.

Any inference engine is sound only relative to the logic implemented and premises accepted. A valid derivation from a false or inapplicable premise remains unsuitable for real-world action.

## Worked comparison: configuration admissibility

Question: *Which realization is admissible for component C in baseline B, and why?*

| Implementation | What it can contribute | What must still be demonstrated |
|---|---|---|
| LLM only | Proposes interpretation or plausible answer | Correct baseline, identity, validity and justification |
| LLM + RAG | Retrieves specification clauses | Effective revision, source authority, complete exceptions |
| LLM + graph | Navigates type/usage/configuration assertions | Correct semantics, provenance and mappings |
| LLM + symbolic rules | Checks admissibility constraints | Rules match the applicable configuration and are independently validated |

A combined system may outperform any individual variant, but superiority is an experimental question. Evaluate the *total workflow*, not just the language output.

## Design checklist

What exactly is authoritative? What is merely a candidate? Can users inspect why one version applies? Which conflicts are preserved? When should the system abstain? Can the outcome be replayed after an ontology or document revision?

**Sources:** *Inhabiting Babel*, chapters 4–7 and 9 (authorial critique). Lewis et al. (2020), *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*, https://arxiv.org/abs/2005.11401 ; W3C OWL 2 overview https://www.w3.org/TR/owl2-overview/ ; W3C SHACL https://www.w3.org/TR/shacl/ .

---

## Continue the guided pathway

[Next: reasoning trust fallacies](reasoning-trust-fallacies.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — adoption and limits](../mcp/adoption-and-limits.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
