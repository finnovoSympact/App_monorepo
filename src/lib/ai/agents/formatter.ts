// Layer 2 node a — reads all docs → FormattedCorpus
// TODO §4: implement OCR/parse, deduplicate, cite source_doc_id
export type FormattedCorpus = {
  lineItems: Array<{ id: string; date: string; amount: number; currency: string; source_doc_id: string }>;
  transactions: Array<{ id: string; date: string; amount: number; description: string; source_doc_id: string }>;
  documents: Array<{ id: string; kind: string; storage_key: string }>;
};
