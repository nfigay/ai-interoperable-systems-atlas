# Agents and Agentic Systems: Definitions, Autonomy and Evidence

## Agent concepts did not originate with LLMs

Agent-based systems and multiagent research predate contemporary generative AI. A classic analytical account, associated with Wooldridge and Jennings (1995), emphasizes **autonomy, reactivity, pro-activeness and social ability**. These are conceptual dimensions, not a universal legal or technical certification checklist. Agent autonomy is also contextual: a bounded delegated task may be autonomous within a defined authority and operating horizon without independent organizational sovereignty.

An LLM is a model capability. A service is a callable interface. A workflow is an orchestration structure. An **agent** is a situated system whose behavior exhibits agent properties, potentially using all of those components. Using an LLM and a tool does not prove those properties. Conversely, a non-LLM system can exhibit them.

## Terms to keep separate

| Label | Minimum useful characterization | What it does *not* prove |
| --- | --- | --- |
| Remote service | Accepts requests and returns results | Autonomy, initiative, goals |
| Chatbot | Conversational input/output | Persistent objective or capacity to act |
| Workflow | Orders steps under rules | Adaptive agent planning |
| LLM tool caller | Can propose structured tool requests | Authorized action or autonomy |
| Agentic workflow | Uses some adaptive selection or planning | Full agent autonomy |
| Agent candidate | Has state, objectives, perception and capacity to choose actions | Adequate performance without observation |
| Multiagent system | Several agent-like systems interact | Valid coordination or interoperability merely from messaging |

The phrase **“agentic agent”** adds little architectural precision without an explicit new property. Prefer **agent**, **LLM-based agent**, **agentic workflow**, or **multiagent system** with stated criteria. Similarly, communication through MCP or a dedicated agent-interaction protocol is evidence of interoperability mechanisms, **not proof of autonomy**.

## An evidence-based characterization grid

| Characteristic | Question to test | Possible evidence |
| --- | --- | --- |
| Decision autonomy | Can the system select actions within delegated bounds? | Run logs of alternatives and selected actions |
| Persistent objectives | Does it retain goals beyond one request? | Inspectable goal/state lifecycle |
| Reactivity | Does it observe environmental changes and respond? | Event→state→action traces |
| Initiative | Does it act or adjust a plan without step-by-step instructions? | Trigger conditions and revised plans |
| Social interaction | Does it coordinate with other actors? | Message semantics, commitments and outcomes |
| Governance (additional axis) | Who authorizes, can interrupt or recover actions? | Policy decisions, consent and audit |

Do not collapse this grid into a binary marketing label or arbitrary numeric “agenticity score”. Record **demonstrated / partial / unobserved**, the conditions of the test, and the limits of inference. Unobserved is not the same as impossible.

## Future Atlas experiments

- Compare a stateless RPC tool with a workflow carrying state.
- Compare a fixed plan with an adaptive plan responding to environmental changes.
- Test explicit delegation of authority, intervention, revocation and recovery.
- Measure whether distributed participants maintain their own state and objective management.
- Explore inter-agent communication separately from access to tools (MCP is not a general proof of agency).

These studies belong in a **separate learning and evaluation path**, not as compulsory additions to the first lightweight MCP demo.

### Sources

- [Wooldridge and Jennings, *Intelligent Agents: Theory and Practice* (1995), ScienceDirect bibliographic record](https://doi.org/10.1017/S0269888900008122)
- [MCP architecture (for the separation of Host, Client, Server)](https://modelcontextprotocol.io/specification/2026-07-28/architecture)
