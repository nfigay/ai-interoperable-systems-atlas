# Atlas First MCP Demonstrator: Architectural Position and Evidence

## Why this note exists

The existing Atlas guided journey is intentionally small. It should remain so. This note, separate from executable screens, explains **what the demonstration implements, which properties can be observed, which are merely proposed, and how future experiments could extend the learning path without distorting the baseline**.

**Public checkpoint:** Git commit `eec84f6` (2026-10-27), a consolidated Atlas publication that included the English interface, knowledge pages and browser MCP demonstration. Reference: [GitHub commit](https://github.com/nfigay/ai-interoperable-systems-atlas/commit/eec84f6).

## Current realization — grounded in the installed implementation history

| Architectural role or concern | Atlas realization | Status |
| --- | --- | --- |
| Host | Browser-based Atlas UI coordinates the lab, user actions, and presentation | Implemented |
| MCP Client | `src/e43/client-worker.mjs`, via MCP TypeScript client SDK | Implemented |
| MCP Server | `src/e43/server-worker.mjs`, via MCP TypeScript server SDK | Implemented |
| Transport | `src/e43/port-transport.mjs` over `MessageChannel` / `MessagePort` | Implemented |
| Invocation | Explicit connect, tool discovery and echo invocation | Implemented |
| Evidence | Observable messages and source inspector in guided lab | Implemented, limited to observed scenario |
| LLM | No LLM required or invoked by the echo experiment | Intentionally absent |
| Network boundary | Both workers run within the same browser environment | Remote distribution not demonstrated |
| SDK | MCP client/server v2.4.0 used in this checkpoint | Source/dependency context; verify lockfile for audit |
| MCP 2025/2026 compatibility | Protocol-era negotiation and conformance evidence not yet established from captured wire messages | **Not demonstrated** |

The client Worker and server Worker provide genuine separate execution contexts, but **not** separate machines, administrative domains, TCP endpoints or independently deployed systems. The MessagePort transport is custom and makes no claim to prove Streamable HTTP behavior. Nor does an echo tool prove identity federation, configuration management, semantics, transactions, or operational robustness.

## What the executable demonstration currently teaches

1. MCP client/server SDK roles can be instantiated in a browser under Host control.
2. A client/server communication channel can support MCP discovery and a real tool invocation without an LLM.
3. The Host's UI can show action phases, source examples and execution evidence.
4. Invocations are structured operations; selecting a tool by an LLM is an **additional** orchestration variant.
5. A local browser setup can be deployed as static assets, including on GitHub Pages.

## Limitations and non-claims

- No verified execution against a **remote** MCP server, browser CORS/auth or public-Internet latency/failure modes.
- No determination that the current SDK/transport uses MCP 2026-07-28; package version is not negotiated protocol version.
- No LLM selection, provider API integration, model gateway, or MCP inference adapter.
- No autonomy, agent planning, goal persistence, multi-agent delegation or agent-to-agent interoperability demonstrated.
- No reproducible evidence for enterprise baselines, remote PLM resources, authority federation or production security.

These are neither defects to conceal nor promises that the current lab fulfills: they define the **experimental boundary**.

## Protocol version comparison: future experimental axis

**Legacy 2025-11-25:** initialization handshake; potential protocol-level sessions; legacy response and event semantics. **Modern 2026-07-28:** stateless, self-describing requests; optional client `server/discover`; required `resultType`; changed subscriptions and multi round-trip behavior. Source: [2026 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog).

For the present lab, first instrument and export the **actual negotiated version, client/server capabilities and request metadata**. Only then design legacy-versus-modern test pairs. If migrating SDK behavior, verify the custom MessagePort transport separately from standards-compliant HTTP/stdio transports. Do not create misleading dual-mode UI switches backed by unverified code.

## Future deployment experiments, without enlarging the embedded lab

| Candidate | Distinct question | New infrastructure / evidence |
| --- | --- | --- |
| Browser-only baseline | Can the same tool invocation be repeated without an LLM? | None; preserve current trace |
| Browser client + remote MCP | Does it work across a real browser/network/security boundary? | Remotely hosted MCP service, HTTPS/CORS/auth, captures |
| Backend Host + MCP client(s) | How are secrets, policy and authority managed centrally? | Node.js or other backend, authentication, application-to-Host API |
| Node.js MCP server | What differs between local stdio and remote HTTP deployments? | Node process, chosen transport, supervision and resource limits |
| Heterogeneous MCP servers | Can clients interact with independently developed implementations? | Cross-SDK interop matrix, exact protocol versions, failure observations |
| LLM-assisted tool choice | Who proposes and who authorizes? | Provider API integration, tool choice policy and approval traces |
| Version bridging | Does legacy ↔ modern adaptation preserve intended semantics? | Protocol adapter, explicit losses and compliance claims |
| Agent-like behaviors | Is any initiative or adaptive goal management observable? | State/perception/plan loop, observation and evidence, separate evaluation |

## What we should document for each experiment

**Goal / question → architectural roles → components and location → deployed software and versions → interfaces and transports → identity and authority → configuration baseline → observable trace → success and failure evidence → limitations → references.** Distinguish **specification requirements**, **implementation facts** and **inferences**. Do not equate an SDK version, a marketing label or a UI animation with a verified protocol capability.

## Explicit separation from the demonstrator UI

This material belongs in the **Atlas knowledge base**, linked from a visual guide and the guided journey, not inside the existing browser lab. The lightweight lab should remain operationally stable and cognitively manageable while these architectural alternatives are explored as optional readings and independently testable future scenarios.

### Sources

- [Atlas public source at the publication checkpoint](https://github.com/nfigay/ai-interoperable-systems-atlas/tree/eec84f6)
- [Official MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
- [Official MCP changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [GitHub Pages limitations](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
