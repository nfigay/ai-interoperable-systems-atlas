# Atlas experimental and editorial working protocol (draft)

Based on BPMNSM DEPP/EDED; adapted for research and editorial artifacts. Exact BPMNSM repository remains the authority for BPMNSM.

1. State the Need and Question before implementation or publication.
2. Define Claim and Context. Distinguish normative source, scientific foundation, engineering convention, and proposed synthesis.
3. Inspect existing files and sources; never reconstruct canonical source from chat history.
4. Determine minimal change and required evidence. Do not create software abstractions merely by preference.
5. Collect Evidence, with source URLs, versions, retrieval dates, testing context and commit when relevant.
6. State Limits and unresolved uncertainties explicitly. No unsupported generalization.
7. Verify targeted changes and run regression (`npm test -- --run`, `npm run build`).
8. Preserve historic decisions and changes in Git; use PR reviews for substantive changes.
9. Differentiate build evidence from deployed-site checks and reader/stakeholder validation.
10. Share only reviewed or explicitly marked provisional entries; do not elevate a draft to a standard.

For experimental software, use the three BPMNSM evidence statuses only when applicable: [NON IMPLÉMENTÉ], [DÉMONTRÉ PAR INSPECTION], [IMPLÉMENTÉ + DÉMONTRÉ]. These statuses do not replace epistemic/source confidence markers in the atlas.
