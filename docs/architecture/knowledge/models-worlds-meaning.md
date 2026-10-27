# A — Models, Worlds and Meaning

**Status:** architectural learning resource · **Evidence class:** authorial perspective + analytical examples · **Not:** a formal theory of universal meaning.

## The architectural problem

A message can arrive intact, conform to a schema, and still be interpreted incorrectly. In heterogeneous enterprises, the word *part* may designate a manufactured occurrence, an engineering definition, a functional role, or a financial inventory item. Even a globally unique identifier cannot, by itself, reconcile those identities. The question for architecture is not simply whether two systems exchange a value, but which commitments permit a receiver to use that value without changing its significance.

*Inhabiting Babel* argues that meaning is situated and mediated, and warns against conflating physical, social/normative, logical and digital worlds (chapters 1–2). This is an **authorial epistemological position**, not an experimentally proven universal law. It is productive as an architectural discipline: require every representation to state what it refers to, from which viewpoint and for what purpose.

## Four statuses, four forms of assessment

| Status | Example | A relevant question | An invalid shortcut |
|---|---|---|---|
| Physical | A serialised pump | Does its measured behavior match the claim? | A correct digital twin is the pump |
| Social / normative | Certification or authorization | Who confers validity, under which rules? | A database field confers legal authority |
| Logical / conceptual | Part type, requirement, ontology class | Is the description coherent in its formal system? | Logical consistency implies empirical truth |
| Digital / computational | Versioned record, event, triple | Does the stored artifact conform and execute? | Stored assertions are necessarily facts |

These are analytical distinctions, not necessarily disjoint software modules. One case can cross several statuses. Identify the *mediations* between them rather than merging them into a common object.

## Why composition is not one relation

An assembly definition contains positions for component types; a particular aircraft contains installed physical items; a functional architecture allocates behaviors; an organization assigns responsibilities. Calling each relation `partOf` silently replaces several distinct predicates by one name. Transitivity cannot be presumed across them. A composition path is meaningful only when each edge and each projection has a declared interpretation.

This relates directly to Atlas's existing explorations of definitions and usages, realized parts, admissible realizations, baselines, and federated registries. The graph explorer is an aid to questioning such relations, not evidence of an ontology-neutral merger.

## Mediation contract

For each transfer or cross-model link, record at least:

1. **Source assertion:** identifier, property, source system, owner, version and validity interval.
2. **Interpretive frame:** viewpoint, domain vocabulary, applicable reference world, intended use.
3. **Transformation:** mapping rule, equivalence strength, assumptions, excluded cases and information loss.
4. **Authority:** who approved the correspondence; scope and review date.
5. **Recipient claim:** what the destination is permitted to infer and what it must not infer.
6. **Contestability:** unresolved disagreements, alternatives, rollback and escalation path.

A translation may be asymmetric and partial. An explicit `unmapped` or `ambiguous` outcome can be more correct than a convenient but invented identity.

## Guided exercise — the word “part”

Compare a certified part type, a particular serialised occurrence, a bill-of-materials usage, and a warehouse stock item. Ask: Which objects can share a definition? Which can change configuration without changing type? Who authorizes a substitution? Which relation is physical, logical, commercial or normative? Draw only justified edges, and label every non-equivalence.

**Expected evidence:** a mapping table, at least one deliberate refusal to equate two entities, and a rationale pointing to an applicable baseline. This tests discipline in modeling, not whether a model “understands” the world.

## Questions to carry forward

Can the mapping be reinterpreted after a vocabulary revision? Who maintains it? Is a disagreement between two descriptions a factual contradiction, or merely a difference of purpose? What requires independent empirical observation, and what requires institutional authority?

**Source note:** *Inhabiting Babel*, chapters 1–3 and 6–9; supplied controlled English translation, consulted for analytical framing. The text is paraphrased, not reproduced. **Related Atlas topics:** definitions/usages, configuration, federated registry, graph projections.

---

## Continue the guided pathway

[Next: llm learning inference evaluation](llm-learning-inference-evaluation.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — roles and invocation](../mcp/roles-and-invocation.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
