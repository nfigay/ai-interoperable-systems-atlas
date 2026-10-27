# Why MCP? Adoption, Architectural Value and Limits

## Adoption is not architectural sufficiency

MCP's adoption is better understood as the convergence of AI application providers and integration developers around a **shared tool/context interface**. It reduces custom connector work: a server exposing a capability can become accessible to several Host applications, and clients can discover tools and schemas rather than hand-code each integration. Availability of SDKs, reusable servers, tutorials and platform support helps explain ecosystem momentum.

These are ecosystem and integration advantages, **not evidence that MCP is mandatory** for distributed systems, more secure by construction, or superior to every established technology. Many mature solutions already provide remote invocation, discovery, transactions, messaging, identity, semantics or systems integration—sometimes with guarantees outside MCP's scope.

## What should be evaluated before adopting MCP?

| Evaluation axis | MCP contribution | What must be assessed separately |
| --- | --- | --- |
| Integration | Common discovery and invocation patterns | Suitability of existing adapters and integration costs |
| Distribution | Protocol usable across local and remote boundaries | Actual transport, network access, availability and latency |
| Tool descriptions | Names, annotations, JSON schemas | Semantics, preconditions, units, identities, authority |
| Security | Protocol guidance, authorization integrations | Trust of tool servers, fine-grained permissions, prompt injection, audit |
| Evolution | Versioned protocol and SDK ecosystem | Backward compatibility, version pinning, provenance and baselines |
| Operations | Invocation and results | Transactions, retries, idempotence, recovery, safety |
| Governance | Host consent/policy expectations | Organizational responsibility, compliance, delegation limits |

**A tool description is not a service-level guarantee**. A tool can have valid JSON arguments and still be wrong for a business situation. Conversely, legacy integration protocols may already have mature contracts, policy enforcement, distributed transaction semantics or domain standards.

## The distinctive risk of model-mediated tool use

MCP introduces no monopoly on remote execution risk, but model-mediated tool selection can create additional ambiguity: a hostile tool description, malicious document or unsafe model proposal can influence what a Host attempts to execute. Thus evaluate *both* the protocol trust boundaries and the model/Host interpretation layer. Treat remote tool outputs as data, not instructions; maintain least privilege and approval requirements.

## A research question for Atlas

For a particular interoperability scenario, determine (a) what MCP enables that existing integration did not, (b) which business and technical requirements MCP does not satisfy, and (c) what observable evidence supports those claims. Use comparable baselines, threat assumptions, runtime traces and explicit limitations. MCP should be assessed as an **enabler and potential disruption**, not presumed replacement of established interoperability approaches.

### Sources

- [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28)
- [MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
- [MCP tools and safety expectations](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
