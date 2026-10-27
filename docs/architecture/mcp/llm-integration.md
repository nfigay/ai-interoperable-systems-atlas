# LLM APIs, Model Gateways and MCP: Complementary Interfaces

## Keep inference and capability access distinct

The Host may communicate with a language model using a **vendor-native inference API**, a provider SDK, a local runtime, or a model gateway exposing a common interface. This is distinct from an MCP client talking to an MCP server. MCP is not a mandatory protocol for accessing an LLM.

### Typical model-assisted tool loop

1. The user or workflow supplies intent, context and constraints to the Host.
2. The Host chooses a model and available tool definitions (possibly derived from MCP discovery).
3. The Host calls an inference API; a model may propose a tool and structured arguments.
4. The Host validates this proposal, applies allowlists and consent policy, and either refuses or dispatches a structured `tools/call` through its MCP client.
5. The MCP server authorizes and performs an operation (directly or via any underlying technology).
6. The Host receives the result and may return it to a model for explanation or to a UI/workflow directly.

The tool-calling format exposed by model APIs and the MCP JSON-RPC wire format are **not identical interfaces**. The Host or its platform maps between them. A structured schema alone does not authorize execution. An MCP tool may expose inference, such as `generate_text`, but that is an architectural option that places an inference adapter behind MCP—not a prerequisite of the protocol.

## Example: multi-model service gateways

Mammouth AI documents sending prompts to providers such as OpenAI, Anthropic, Mistral, Gemini and inference routing services through **model-provider APIs**. Separately, Mammouth offers **MCP connectors** to external tools and services. This supports an inference-versus-tool-access distinction; it does not establish Mammouth's complete internal component architecture.

Its connector documentation also describes compatibility requirements (including Streamable HTTP and `initialize` for its documented implementation). Check current provider documentation and the actual negotiated version before claiming compatibility with modern MCP.

## Why manual ChatGPT copy/paste is different

An operator may paste tool output into a chatbot and paste a reply back. This is a **human-mediated workflow**, not automated communication between the Host and model. Such experiments can clarify reasoning but lose typed contracts and are fragile with respect to confidentiality, provenance, reproducibility and policy enforcement. An API-based integration can preserve structured data and automate controls, provided it is designed and tested appropriately.

## Architecture choices for future Atlas experiments

- **No LLM:** button → Host → MCP client → MCP server; current reference case.
- **Host-mediated inference:** Host → model API for proposal, then policy → MCP call.
- **Model gateway:** Host → common model API → selected providers, independently of MCP.
- **MCP inference adapter:** Host MCP client → inference tool server → model API.
- **Server-side sampling/elicitation:** protocol-version-specific; verify carefully, especially across the 2026 change to multi round-trip interactions.

Do not expose private provider API keys in public browser bundles; use controlled backends, delegated credentials or suitable ephemeral mechanisms when supported.

### Sources

- [MCP architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
- [MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
- [Mammouth: privacy with model providers](https://info.mammouth.ai/docs/privacy-with-model-providers/)
- [Mammouth: connectors (MCP)](https://info.mammouth.ai/docs/connectors/)
- [OpenAI API: function calling](https://platform.openai.com/docs/guides/function-calling)
