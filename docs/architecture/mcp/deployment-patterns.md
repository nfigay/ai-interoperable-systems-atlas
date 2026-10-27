# MCP Deployment Patterns: Browser, Servers, and Networks

## One logical architecture, several realizations

**Host, client and server are logical MCP roles**; deployment concerns refer to execution contexts, process boundaries, transports and trust zones. A Host may consist of a browser app, a local desktop app, an unattended backend or a logically distributed orchestration solution. MCP does not oblige its Host to render a UI. Its client may be in the browser or backend; a remote MCP server may be accessed over a network with supported transports and security controls.

### Pattern A — All in one browser

`Browser Host / UI → Web Worker client → MessagePort transport → Web Worker server → local tool`

Advantages: no backend, repeatable pedagogical scenario, easy static-site hosting. Limits: no remote network interoperability demonstrated, no secret server credentials, browser origin/sandbox restrictions, limited filesystem/process capabilities. A Web Worker is a browser execution context, not a remotely deployed server.

### Pattern B — Browser Host, remote MCP server

`Browser Host / client → HTTPS + browser-compatible MCP transport → remote MCP server → capability`

Advantages: crosses a real deployment/network boundary. Constraints: CORS/preflight and allowed headers, HTTPS/mixed-content restrictions, server availability, authentication and authorization, origins, consent, data exposure, streaming behavior and timeouts. A static GitHub Pages site may host the browser code; **Pages does not itself run a persistent Node.js MCP server**.

### Pattern C — Browser UI, backend Host

`Browser UI → application HTTPS/WebSocket API → backend Host + MCP clients → remote MCP servers`

Advantages: protects API keys, central policy enforcement, central observability, easier server-to-server networking. New issues: trusted backend, multiuser isolation, browser-to-Host protocol, operational deployment, identity delegation and authorization boundaries. Do not call the UI-to-backend protocol “MCP” unless it actually is MCP.

### Pattern D — Distributed logical Host and multiple MCP services

`UI / workflow → Host orchestration service → MCP client gateway(s) → MCP server(s) → heterogeneous systems`

Advantages: scaling, organizational separation, heterogeneous runtimes. Risks: coordination, distributed state, policy propagation, endpoint trust, partial failures, retries, latency, tracing and version alignment. One logical Host may be realized by several cooperating components; that topology is an application design, **not a new MCP role defined by the specification**.

### Pattern E — Node.js local/remote server

Node.js can host a real MCP server as a local process (stdio where supported) or a remotely hosted network service (for example HTTP with suitable MCP transport). It requires runtime hosting (VM, container, PaaS or comparable service), not just compiled front-end assets. A browser generally cannot launch arbitrary Node.js subprocesses or connect to stdio by itself. Other runtimes—Python, Java, Go, managed application servers, workers with appropriate APIs—can play the same server role if protocol and transport requirements are met.

## What GitHub provides (two different responsibilities)

- **GitHub repository + Actions**: versioned source, automated tests, static build and deployment pipeline.
- **GitHub Pages**: serves generated HTML/CSS/JS, SVGs and other static assets, including browser Workers. Pages is not a process-hosting service for persistent MCP backends.

Consequently, the present Atlas demonstration can run entirely from Pages after assets load, whereas a future *remote* Node MCP server must be hosted separately and reached from the browser/backend by a compatible transport.

## Browser restrictions to test explicitly

Cross-origin requests and CORS, certificate/HTTPS requirements, permission and credential exposure, HTTP streaming and browser fetch limitations, restrictions on local sockets/processes/files, limitations from Content Security Policy, availability of Worker and MessageChannel APIs, authorization code flows and token handling. Avoid unexamined assumptions about browser support for server-initiated features and version-specific streaming.

### Sources

- [MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
- [MCP protocol changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
