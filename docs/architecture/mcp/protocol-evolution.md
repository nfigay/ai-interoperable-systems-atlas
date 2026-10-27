# MCP Protocol Evolution: 2025-11-25 to 2026-07-28

## Why these versions should not be conflated

MCP SDK package versions and negotiated **MCP protocol versions** are separate concerns. A library able to implement both protocol generations does not prove that an application exercised both. A **legacy** client and a strictly **modern** server can fail to communicate because their startup messages, required metadata and results differ. Verify compatibility from actual requests, responses and SDK configuration, not package metadata alone.

## Important changes specified for 2026-07-28

| Topic | 2025-11-25 | 2026-07-28 | Engineering implication |
| --- | --- | --- | --- |
| Lifecycle | `initialize` + `notifications/initialized` | No protocol handshake; requests are self-contained | Modern clients attach version and capabilities to every request |
| Discovery | Capabilities negotiated at initialization | Server implements `server/discover`; invocation optional for client | Explicit version/capability probe; consider legacy fallback |
| Sessions | Transport session ID possible | Protocol sessions removed | Cross-call state requires explicit server-minted handles |
| Results | Ordinary result patterns | Required `resultType` (`complete` or `input_required`) | Response handling must distinguish completion from pending input |
| Server input | Server-initiated requests | Multi Round-Trip Requests (MRTR) using `input_required` and retry | Revise sampling/elicitation workflows |
| Notifications | Older GET and resource subscription patterns | `subscriptions/listen` POST stream | Revise change subscriptions and reconnect logic |
| Task support | Experimental in core | Official extension | Feature tests must check extension support |
| Caching | Less explicit | `ttlMs`, `cacheScope` | Respect freshness and disclosure boundaries |
| HTTP | Earlier streaming headers/resumption | Method/name headers; changed streaming and resumption | Network proxy/client behavior must be retested |

The changelog also documents removed methods, authorization issuer checks, JSON Schema changes and tracing conventions. Avoid simplifying the change to merely replacing `initialize` with `server/discover`: the message contract and exchange patterns changed substantially.

## What typically stays reusable

A business function such as `echo(text)` or `resolve_configuration(assemblyId, baselineId)` can often be reused behind either protocol generation. Its wrapper, transport handling, tool registration and result encoding may require migration. Reuse of a business function is **not** proof of interoperable protocol implementations.

## Compatibility strategies

- **Legacy only:** preserve the older wire behavior for existing integrations.
- **Modern only:** reject peers unable to communicate using 2026-07-28.
- **Version-aware client/server:** use supported SDK negotiation or explicit compatibility adapters, then record the selected protocol era.
- **Gateway:** if justified, terminate one version and reissue another; document losses, behavior changes and trust boundaries.

A migration should be validated for exact SDK package and transport combinations; do not assume an SDK's advertised modern support automatically covers every custom transport or feature.

## Comparison experiment specification (not yet implemented in Atlas)

1. Capture a legacy handshake and `tools/list` + `tools/call` on the current MessagePort path.
2. Capture the actual protocol version and declared capabilities.
3. Attempt a strict 2026-07-28 client/server exchange with explicit `_meta` fields and `resultType`.
4. Deliberately pair incompatible peers and document error handling.
5. If a supported automatic fallback is available, repeat with fallback and trace version selection.
6. Repeat selected scenarios over network transport to separate protocol issues from MessagePort-specific issues.

Do **not** label the current embedded Atlas demonstration as supporting 2026-07-28 without recording the corresponding traffic and validating the SDK/transport configuration.

### Sources

- [Official MCP 2026-07-28 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)
- [MCP 2025 lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)
- [MCP TypeScript SDK v2 — protocol versions](https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions)
