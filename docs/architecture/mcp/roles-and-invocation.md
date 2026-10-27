# MCP Architecture: Roles, Invocation and Control

## Roles, not deployment units

The MCP architectural distinction is **Host / MCP Client / MCP Server**. The Host coordinates connections, policy, context and optional model use. It creates/manages MCP client instances. A client handles the protocol conversation with one server. A server exposes tools, resources and prompts and may execute work itself or use other technologies. A logical role does not imply one machine, container, browser tab or microservice. A Host need not be an interactive desktop application, although user-facing hosts commonly manage consent and tool presentation.

The protocol is a standard between MCP clients and MCP servers. **It does not standardize how a Host calls a language model.** The Host may use a vendor model API, a local inference engine, a gateway, a separately designed MCP inference tool, or no model. A server exposing an inference tool is an integration choice, not an MCP requirement.

## Tools are structured capabilities

A typical tool exposes a name, a description and an input schema. The Host decides which of the discovered tools to make usable. A user, deterministic rule, workflow or model can initiate a tool invocation. A language model typically interprets natural-language intent and **proposes** a tool name and arguments through its own tool-calling interface. The Host can refuse, narrow, correct or request approval before sending a structured `tools/call` through its MCP client. The server independently validates and authorizes operations.

**Natural language is not the MCP invocation format.** It may be used before MCP to interpret user intent, but MCP exchanges structured JSON-RPC messages. Descriptions and schemas improve discoverability; they do not guarantee the model will select the right tool, nor that the intended business action is safe.

### Control checkpoints

1. Define trusted servers and permitted connections, including credentials and origin.
2. Discover tools, then restrict what the model or UI can see according to role and task.
3. Validate tool names and argument schemas; also validate business preconditions and resource identity.
4. Distinguish a model suggestion from an authorized action; require confirmation for sensitive operations.
5. Enforce server-side authorization, rate limits and least privilege independently of Host checks.
6. Retain evidence: which actor initiated the invocation, which tool and version, arguments permitted to log, result, errors and policy decisions.

## MCP is not the enterprise semantics layer

MCP can relay identities, descriptions, input/output schemas and results, but an underlying operation's semantics, baseline, versioned configuration, provenance, transactional guarantees and organizational authority generally need other, explicit mechanisms. Compare MCP tool metadata with model-based engineering references and governance mechanisms rather than treating them as substitutes.

## Four useful controlled experiments

| Initiator | Host orchestration | What stays the same |
| --- | --- | --- |
| User button | Explicit invocation after policy checks | MCP tool contract and server validation |
| Deterministic workflow | Rule selects tool and structured arguments | MCP tool contract and server validation |
| LLM proposal | Model suggests tool; Host checks, optionally requests approval | MCP tool contract and server validation |
| Forbidden or high-impact request | Host rejects or requests approval; server enforces permissions | Model cannot grant authorization |

For a useful comparison, reuse **the same server and tool**; vary the decision and control layer. Measure messages, decisions and outcomes, not merely successful invocations.

### Sources

- [MCP architecture (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
- [MCP tools and user interaction model](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [MCP 2025 specification](https://modelcontextprotocol.io/specification/2025-11-25)
