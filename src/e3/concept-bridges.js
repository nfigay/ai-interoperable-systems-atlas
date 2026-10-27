// Editorial links to illustrative examples; NOT identity equivalences.
export const conceptExamples = Object.freeze({
  'AI-CON-002': ['occ:ref-agent','occ:alt-agent'],
  'AI-CON-003': ['occ:ref-workflow','occ:alt-workflow'],
  'AI-CON-004': ['occ:ref-client','occ:ref-server','occ:alt-client','occ:alt-server']
});
export function exampleUrl(occurrenceId) {
  return '#federated-configurations?occ=' + encodeURIComponent(occurrenceId);
}
