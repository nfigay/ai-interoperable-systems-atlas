# B — How LLMs Learn, Infer and Are Evaluated

**Status:** technical learning resource · **Evidence class:** technical synthesis + explicit epistemic distinctions.

## What is actually implemented?

A conventional autoregressive LLM processes token sequences using learned parameters, computes conditional token probabilities, and generates an output with a decoding policy. The usual training trajectory comprises tokenization, broad pretraining on data, and some form of post-training such as supervised instruction tuning or preference-based optimization. A deployed model may be serialized as weight tensors with associated tokenizer, architecture and configuration files, potentially quantized to trade fidelity, speed and memory. This is **model serialization**, distinct from serializing prompts, chat history or retrieved documents into an inference context.

Neither the protocol used to call the model nor the presence of a chat interface determines the internal training regimen. Provider versions, system prompts and sampling configurations affect reproducibility; exact implementations may not be publicly disclosed.

## The runtime is more than the weight file

A model request is an execution configuration: model ID and revision, tokenization, input messages, instructions, decoding parameters, available tools, and possibly external context assembled by a harness. A local weight file can be identical while two deployments yield different behavior because of retrieval data, system instructions, permissions, temperature, or tool outcomes. External retrieval normally changes the **input**, not the model's learned parameters; fine-tuning changes parameters. These approaches should not be conflated.

## What does it mean to “reason”?

At least five meanings should be separated:

- **Task success:** the produced answer satisfies an independently specified problem.
- **Inference over premises:** a conclusion follows logically if the premises and rules are granted.
- **Problem solving:** a procedure finds a solution, perhaps by planning, search, approximation or internal computation.
- **Explanation:** a natural-language narrative makes an answer intelligible; it is not automatically a faithful causal account of computation.
- **Justification or proof:** externally inspectable grounds demonstrate validity within a specified framework.

A model can produce valid proofs on some tasks and invalid ones on others. It can solve problems beyond memorized examples, yet a fluent explanation does not certify that the stated reasoning process was the actual mechanism. The epistemological claim in *Inhabiting Babel*, chapter 7, that language fluency cannot in itself establish world understanding, should be presented as the author's argued position. It is compatible with empirical investigation of genuine task competence; it is not a reason to disregard observed abilities.

## The grounding problem

Models may encode many relations learned from descriptions of the world. Whether this constitutes “understanding” depends on the chosen philosophical and operational criterion. For architecture, the actionable questions are narrower: Can a claim be bound to a source? Does it refer to the correct version of an object? Is its validity observational, logical, normative or procedural? What independent check can falsify it?

A multimodal model or a tool-using model may acquire richer evidence channels, but neither sensory input nor a tool call guarantees that a particular assertion is true or applicable.

## Evaluation is a claim about a defined operating envelope

For one task define: input distribution, authorized context, expected output, ground truth or review procedure, allowed tools, versioned environment, error costs and acceptance thresholds. Evaluate false confidence, non-answer behavior, sensitivity to irrelevant wording, unseen cases, temporal drift, contradictory documents and permission boundaries. Record both aggregate metrics and counterexamples. For probabilistic inference, rerun cases and report variability rather than promoting one success into a general guarantee.

**Exercise:** supply the same configuration-admissibility problem under (i) correct premise, (ii) obsolete baseline, (iii) ambiguous identifier, (iv) false premise. Ask for answer, evidence, and explicit abstention when needed. Only the independently checked result counts as observed correctness.

## Architectural conclusion

The LLM is a learned computation component. A **model runtime** executes it; a **harness** shapes the interaction; knowledge services supply context; validators may establish narrower correctness properties. The model's capacities must be characterized empirically under these surrounding conditions.

**Source distinctions:** *Inhabiting Babel*, chapter 7, supplies the critical epistemological framing; technical description draws on conventional Transformer and language-model architecture, not on a claimed implementation disclosed by the book. **Foundational reading:** Vaswani et al. (2017), *Attention Is All You Need*, https://arxiv.org/abs/1706.03762 ; Bender & Koller (2020), https://aclanthology.org/2020.acl-main.463/ .

---

## Further analysis: inference system, serialization and evaluation

## Three different forms of 'serialization'
1. **Model serialization:** persistence of parameter tensors, tokenizer, architecture metadata, quantization and runtime compatibility. It does not serialize a model's transparent set of propositions about the world.
2. **Prompt/context serialization:** text and structured messages presented at an inference call, including instructions, tools, references and retrieved passages. Order, role separation, truncation and injection boundaries matter.
3. **Knowledge serialization:** formal external artifacts (documents, RDF assertions, ontologies, configuration records, provenance). Persisting them does not prove that the model interpreted them correctly.

The term 'augmented serialization' is ambiguous: if intended to mean RAG augmentation, distinguish RAG retrieval and context assembly from model-weight serialization. Ask authors to name the actual artifact and boundary.

## Training, inference and alignment
Pretraining changes weights from optimization over datasets. Instruction tuning and preference optimization also usually change model behavior by training (with potentially different objectives). Inference computes responses with learned weights, selected runtime parameters and a configured context. RAG changes the retrieved material and usually the inference input **without retraining**. Tool invocation delegates external computation; it is neither retrieval alone nor a proof that the model understands the tool's world.

## Model/system distinction
Reproducibility of a closed commercial model is not equivalent to replaying the same API request: revisions, routing, provider infrastructure, hidden settings, tool inputs and nondeterministic compute may change. Record the *whole inference system* identity rather than a brand name alone: model identifier, provider, observed date, harness revision, instructions, retrieved corpus/index snapshot, decoding options, tools and outputs.

## Operationalizing 'reasoning'
Distinguish formal entailment, search/planning, valid problem solution, plausible explanation, grounded world claim and justified institutional decision. Each requires different criteria and evidence. A syntactically coherent chain is not necessarily an inspectable proof. Conversely, failure in one benchmark cannot establish that every language model lacks every kind of reasoning.

**Guided comparative case:** ask for an admissible engineering part under a named baseline; repeat with a newer but irrelevant baseline, a fabricated authority claim and insufficient information. Evaluate correctness, refusal, provenance, temporal applicability and whether formal postconditions can be checked.

**Attribution and debate:** Chapter 7 of *Inhabiting Babel* advances a strong critique of linguistic fluency as world understanding. Treat that as the author's position; complement with operational metrics and explicitly state what those metrics do *not* settle philosophically.

---

## Continue the guided pathway

[Next: rag ontologies neurosymbolic](rag-ontologies-neurosymbolic.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — llm integration](../mcp/llm-integration.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
