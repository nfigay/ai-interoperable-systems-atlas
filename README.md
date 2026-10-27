# Atlas — Entrée de premier niveau du voyage MCP

Le voyage E4 était monté dans l'explorateur E3, sans lien depuis le menu latéral principal.
Cette tranche ajoute `#voyage-agent-mcp`, un accès dans la navigation principale, une page autonome utilisant le même modèle JSON et le laboratoire navigateur existant.

Le script `scripts/install-voyage-entry.mjs` modifie `src/main.js` de manière ciblée, conserve une copie `.before-voyage-entry.bak`, échoue sans écrire si les points d'insertion ne correspondent pas et reste idempotent.

Les liens vers les occurrences E3 utilisent `#federated-configurations?occ=...`. Aucun prototype réseau ni conformité MCP n'est revendiqué.

Après installation : `npm test`, `npm run build`, `npm run dev` puis ouvrir `#voyage-agent-mcp`.
