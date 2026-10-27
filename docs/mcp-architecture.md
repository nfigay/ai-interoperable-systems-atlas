# MCP, LLMs and Agents — Architectural Learning Resources

**Purpose.** A guided, evidence-conscious entry point to understand the Model Context Protocol, its 2026 evolution, its relationship with LLMs and agents, and what the first Atlas browser demonstrator actually proves.

These resources **complement the existing guided MCP journey**; they do not add steps, controls or external dependencies to its execution. Statements are marked as **specified**, **implemented**, **inferred** or **not yet demonstrated** when necessary. The posters are visual syntheses, not compliance certificates.

## Start with the three visual guides

### 1. MCP in Practice — roles, tools, control

![MCP in Practice poster](posters/01-mcp-in-practice.svg)

[Open the poster as a standalone SVG](https://nfigay.github.io/ai-interoperable-systems-atlas/posters/01-mcp-in-practice.svg) · [Read the architecture and invocation guide](architecture/mcp/roles-and-invocation.md)

### 2. MCP 2026-07-28 — evolution and compatibility

![MCP 2026 evolution poster](posters/02-mcp-2026-evolution.svg)

[Open the poster as a standalone SVG](https://nfigay.github.io/ai-interoperable-systems-atlas/posters/02-mcp-2026-evolution.svg) · [Read the protocol evolution guide](architecture/mcp/protocol-evolution.md)

### 3. Deployment patterns and LLM integration

![MCP deployment and LLM poster](posters/03-mcp-deployment-llm.svg)

[Open the poster as a standalone SVG](https://nfigay.github.io/ai-interoperable-systems-atlas/posters/03-mcp-deployment-llm.svg) · [Read the deployment patterns guide](architecture/mcp/deployment-patterns.md)

## Continue the analysis

- [Why MCP? Adoption, engineering value and limits](architecture/mcp/adoption-and-limits.md) — an adoption trend does not prove architectural superiority.
- [LLM APIs, model gateways and MCP](architecture/mcp/llm-integration.md) — separate inference from tool protocols; Mammouth as a documented example.
- [Agents and agentic systems: definitions, autonomy, evidence](architecture/mcp/agents-and-evidence.md) — distinguish remotely callable services, workflows and actual agency.
- [Our first Atlas demonstrator: realization and next experiments](architecture/mcp/atlas-demonstrator-position.md) — mapping from logical roles to Web Workers and deployment choices.

## Guided reading path

1. **Understand:** host, MCP client, MCP server, and optional LLM.
2. **Compare:** the 2025-11-25 and 2026-07-28 protocol generations.
3. **Locate:** logical roles versus browser, Node.js, network and hosting choices.
4. **Evaluate:** adoption claims, tool governance and agent autonomy.
5. **Observe:** use [the existing live journey](#voyage-agent-mcp), then compare its trace with the [architectural position](architecture/mcp/atlas-demonstrator-position.md).

## Reading discipline

The first Atlas scenario runs real MCP SDK client/server code inside Web Workers; it is **not** evidence of remote HTTP interoperability, LLM orchestration, deployed multiagent autonomy or conformity with both protocol generations. Those remain distinct architectural hypotheses and future experiments. Never infer a negotiated MCP protocol version from a package version alone.

Authoritative references: [MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture), [MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), [2026 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog), [2025 specification](https://modelcontextprotocol.io/specification/2025-11-25).
