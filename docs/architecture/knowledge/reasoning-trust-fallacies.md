# D — Reasoning, Trust and Architectural Fallacies

**Status:** critical study · **Evidence class:** authorial perspective, conceptual tests and proposed empirical evaluations.

## Trust is relational and bounded

Do not ask only “Can this LLM be trusted?” Ask: trusted **by whom**, for **which decision**, on **which inputs**, in **which configuration**, with **what consequences**, and under **which verification and appeal procedures**? Trust in a draft summary, an admissibility calculation, a change request and a safety-critical release cannot be conflated.

Reliability is empirical; validity is relative to task criteria; authority is conferred by institutional arrangements; accountability concerns who must answer for decisions and outcomes. A language model's assertion of confidence is not an audit record, and agreement with a user is not independent corroboration.

## Reasoning claims need a standard of evidence

The words *understanding* and *reasoning* can refer to observable problem-solving competence, logical entailment, context-sensitive interpretation or philosophical claims about cognition. None of these uses should be silently substituted for another. *Inhabiting Babel*, chapter 7, challenges the inference from fluent language to grounded semantic authority. This is a motivating thesis; operational investigations must still define what counts as success or failure.

A persuasive chain of explanation may be post hoc. To establish a formal result, check premises, transformation rules, applicability, proof artifact and independent verifier. To establish an empirical result, check measurements and provenance. To establish a legitimate decision, check authorization, contestability and consequences.

## Fallacy catalogue — provisional tests, not universal diagnoses

| Tempting inference | Missing justification | Candidate test |
|---|---|---|
| Syntactic exchange → shared meaning | Shared field semantics and use conditions | Swap two domain meanings under identical JSON |
| Graph connectivity → knowledge | Truth, authority, and assertion scope | Introduce contradictory dated sources |
| Embedding proximity → identity | Identity criteria | Same label for a type and occurrence |
| Logical validity → real-world truth | Premise relevance and empirical correctness | Reason from a false premise |
| Fluency → understanding | Independent competence criterion | Reframe question and test counterfactuals |
| Explanation → proof | Replayable validation | Verify conclusion without model's narrative |
| MCP tool call → agent autonomy | Own goals, initiative, state, policy | Invoke same tool with a button and with an agent |
| Tests pass → deployment safe | Coverage, environment, operational boundary | Cross from browser Worker to remote network |
| Human approval → accountability | Meaningful authority, comprehension, evidence | Identify a rubber-stamp approval |
| Standard adoption → semantic interoperability | Contextual translation, governance | Compare conflicting versions of a vocabulary |

These are **diagnostic prompts**. Each requires a stated falsification criterion; otherwise “fallacy” risks becoming another rhetorical label.

## Disagreement and sycophancy

A model may adapt its response to an interlocutor's framing. That can help collaborative drafting but can undermine its value as an independent reviewer. Test opposed prompts on identical evidence; require an external oracle when assessing technical correctness. Agreement between multiple sampled model outputs is not necessarily independent evidence, particularly when models share sources or assumptions.

## A trust dossier for a claim

For any substantive recommendation, record: claim text; asserted class (fact, interpretation, prediction, policy, hypothesis); input provenance; applicable viewpoint and baseline; alternative explanations; validation technique; limitations; authorized recipient; permitted downstream uses; escalation when uncertain. A missing entry is not necessarily a fatal defect, but it must be visible.

## Guided exercise — confident but wrong

Give an LLM an out-of-date configuration manifest together with an authoritative-looking narrative. Ask it to justify an admissibility decision. Evaluate (a) factual correctness, (b) recognition of version conflict, (c) refusal to overclaim, (d) independent check. Next give the same information to a deterministic validator and examine its dependence on valid input premises.

**Interpretation limit:** a failed answer demonstrates failure in that condition, not the universal impossibility of model reasoning; a successful answer demonstrates scoped competence, not epistemic authority.

**Source alignment:** *Inhabiting Babel*, chapters 1, 5, 7–8; supplied LinkedIn editorial reference “Authority, Responsibility, Accountability, and Verification” motivates separation of generated claims from independently checked outcomes. This resource is an original analytical synthesis, not a reproduction of the articles.

---

## Further analysis: trust boundaries and fallacy tests

## Scope of justified reliance
Replace binary 'trustworthy / untrustworthy LLM' with a *reliance claim*: **actor + task + context + configuration + available evidence + potential harm + required oversight**. A model useful for brainstorming may not be authorized to choose a certified component. Reliability is empirical; formal validity concerns derivation; legitimacy and accountability require responsible organizations.

## Five distinct evidence paths
| Claim | Appropriate validation | Invalid shortcut |
|---|---|---|
| A source said X | Document identity, quote/context, effective version | LLM says it saw a source |
| A proposition follows from rules | Premises, declared inference rules, independent proof checker | Fluent explanation |
| X is physically true | Measurements or independently trusted observations | Ontology/class membership |
| Action Y occurred | Execution trace, server acknowledgement and postcondition | Assistant's success message |
| Y was authorized and legitimate | Delegation record, policy decision and domain authority | Passing tests or an approval button |

## Fallacy claims must be contestable
For every purported fallacy provide: **the tempting claim**, *missing warrant*, counterexample, test conditions, alternative explanations, responsible authority and limitations. A single adversarial prompt illustrates a risk but does not measure its prevalence. An anecdotal case in a manifesto is not automatically an audited field study.

## Protocol for sycophancy
Construct paired prompts with identical task evidence but opposed framing, plus a neutral control. Randomize order; keep model version, instructions and sampling tracked. Use an independent task oracle, not inter-model agreement alone. Report error rates and uncertainty. Do not conflate reasonable sensitivity to requested style with factual agreement against evidence.

## Semantic failure modes
Compare *type vs occurrence*, *current vs obsolete baseline*, *term correspondence vs identity*, and *proof from valid premises vs proof from false premises*. Different errors demand distinct mitigation (retrieval revisioning, namespace/crosswalk, policy enforcement, external verification).

**Primary authorial connection:** *Inhabiting Babel* Ch. 1, 5, 7–8; the manuscript's self-described critical role should be preserved. LinkedIn editorial examples motivate tests, not replace them.

---

## Continue the guided pathway

[Next: harness agents delegation](harness-agents-delegation.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — agents and evidence](../mcp/agents-and-evidence.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
