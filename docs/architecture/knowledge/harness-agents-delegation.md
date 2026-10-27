# E — Harnesses, Agents and Responsible Delegation

**Status:** architecture and governance · **Evidence class:** historical terminology + authorial perspective + proposed controls.

## System boundaries first

A model is not a harness; a harness is not automatically an agent; an agent is not an MCP server. Distinguish the **model/runtime** (inference), **harness** (context assembly, tool routing, loops, state, policy checks, logging), **MCP Host** (application coordinating one or more MCP clients), **MCP Client** (protocol participant), **MCP Server** (capability exposure), **external system** (the actual domain resource), and **accountable actors** (people or institutions granting authority).

These are roles. One process can implement several roles, and a distributed deployment can split one logical role across services. MCP does not define an agent's goals, ontology, trustworthiness or degree of autonomy.

## What warrants the name “agent”?

Classical accounts discuss autonomy, reactivity, pro-activeness and social ability. Agentiveness is better evaluated as an observable behavioral profile than inferred from an SDK import or branding. A programmatic loop that chooses among tools is not necessarily a persistently autonomous agent. Conversely, a rule-based system can have agent-like behavior without an LLM.

The phrase *agentic agent* adds little unless an additional property is defined. Prefer precise qualifiers: *tool-using workflow*, *LLM-based agent*, *autonomous agent*, *multi-agent collaboration*, *remote delegated service*.

## Delegation as an explicit contract

A user instruction is not always sufficient authorization to perform a consequential operation. A robust delegation model records:

| Element | Architectural question |
|---|---|
| Principal | Who legitimately delegates? |
| Goal and scope | What outcome and boundary are authorized? |
| Capabilities | Which systems, data and operations are accessible? |
| Decision rights | What can the harness decide without further approval? |
| Safeguards | What must be checked independently? |
| Escalation | What requires human judgment or domain authorization? |
| Evidence | Which inputs, actions, transformations and validations are logged? |
| Revocation | How is authority withdrawn, including from running tasks? |
| Accountability | Who answers for the outcome and can contest it? |

Approval must be **informed and effective**, not a decorative click. Authorization must be enforced where actions are performed, including at the underlying service; a polite prompt is not a security boundary.

## Read, recommend, write, execute

Delegation is risk-graded. Reading a public document, suggesting a mapping, proposing a change, committing a change, publishing it, and initiating a real-world act have different consequence classes. Controls should tighten as reversibility decreases and the impact radius increases. Independent verification is especially important when the same LLM that produces a change also declares it correct.

## Harness observability

Record prompt/template revision, model/service identifier, tool schemas, policy version, input sources, context selection, planned actions, actual calls, server responses, checks, user approvals and recovery. Never infer a successful action from a generated assertion; use service acknowledgments and observable postconditions. A trace can establish **what happened**, but not necessarily **that it was meaningful or legitimate**.

## Atlas's present boundary

The current embedded demonstration has a browser Host, actual MCP client/server code in separate Web Workers and a MessagePort transport for a local echo flow. It does **not** establish autonomous agency, remote service security or LLM inference. In the immediate documentation phase, retain this simple evidence boundary and use architecture diagrams to describe future distributions, including remote HTTP servers and hosted harnesses.

## Exercise — delegation ladder

For a request to update an engineering configuration, identify: (1) data inspection, (2) candidate change proposal, (3) constraint validation, (4) change approval, (5) commit, (6) public release. Specify which steps a system may perform autonomously, which require independent evidence, and who holds release authority. Deliberately include a failing test or stale baseline and observe where the chain stops.

**Sources:** Wooldridge & Jennings (1995), *Intelligent Agents: Theory and Practice*; *Inhabiting Babel*, chapter 8; supplied LinkedIn editorial references on authority and verification. **Connection:** published Atlas MCP architectural guide, without modifying the demonstrator.

---

## Further analysis: delegation contracts and accountability

## Role-responsibility matrix
| Logical role | Typical function | What it does **not** imply |
|---|---|---|
| LLM / inference runtime | Generates candidate text, decisions or tool arguments | Authority, guaranteed truth, autonomous agency |
| Harness / orchestration | Builds context, chooses workflow, manages policy, state, retries, tool mediation | That the model alone selected or executed a tool |
| MCP Host | Coordinates MCP clients within an application | Necessarily a graphical UI, remote server or agent |
| MCP Client | Speaks protocol with a server | Makes domain decisions automatically |
| MCP Server | Exposes capabilities and checks local authorization | Supplies domain meaning, institutional delegation or a universal trust boundary |
| Domain backend | Performs authoritative reads/writes under its own rules | That a requested action was authorized merely because invocation syntax was valid |
| Human / organization | Grants mandate, sets policies, reviews/appeals and answers for impacts | That every click constitutes informed oversight |

## Delegation contract (proposed analytical schema)
`principal`, `mandate`, `scope`, `systems`, `operation-class`, `data-boundary`, `validity-window`, `allowed-autonomy`, `required-verification`, `approval-authority`, `revocation-mechanism`, `audit-evidence`, `appeal-route`.

Categorize each operation as **read / propose / stage / validate / commit / publish / physical action**. Both authority and independent verification may vary by class and reversibility. The executable enforcement boundary must be named: a prompt saying 'do not publish' is not access control. A server's successful invocation is not sufficient evidence of correct downstream effects.

## Agency must be established, not named
Evaluate stated objectives, state continuity, responsiveness, initiative, delegated decision rights, capacity to interact and capacity to alter the environment. Score **not observed** rather than 'not autonomous' when the trace does not permit inference. An 'agentic workflow' can be tightly scripted; an agent need not use an LLM. Avoid treating 'agentic agent' as a distinct technical category absent additional criteria.

## Browser-specific considerations
A GitHub Pages site can distribute static JS/HTML and workers, but not persistently run a Node server. Browser clients face origin policy (CORS), accessible transports, credential exposure, permission prompts, deployment and lifecycle constraints. A backend Host moves credential and policy enforcement to server-side infrastructure but introduces new trust and network boundaries. The current MessagePort scenario demonstrates an in-browser protocol exchange, not network-grade service security or production delegation.

## Research question
When does a 'human in the loop' provide genuine accountability? Review whether the human can inspect evidence, reject, edit, stop, reverse and contest a consequential action before it takes effect. A formal approval event may be a rubber stamp if the evidence is unavailable or incomprehensible.

---

## Continue the guided pathway

[Next: experiments evidence](experiments-evidence.md) · [Overview](../../knowledge-semantics-reasoning.md)

**Cross-reference:** [MCP architecture — agents and evidence](../mcp/agents-and-evidence.md). This cross-reference does not imply that MCP supplies the semantic or validation guarantee discussed here.
