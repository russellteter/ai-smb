export type CsvLeadRow = {
  name: string;
  vertical: string;
  phone?: string | null;
  website?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  owner_phone?: string | null;
  score?: number | null;
  signals?: Record<string, unknown>;
  evidence_links?: string[];
};

export function toCsv(rows: CsvLeadRow[]): string {
  const headers = [
    'name','vertical','phone','website','street','city','state','zip','owner_name','owner_email','owner_phone','score','signals','evidence_links'
  ];
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    const needsQuote = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuote ? `"${escaped}"` : escaped;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    const line = [
      r.name, r.vertical, r.phone, r.website, r.street, r.city, r.state, r.zip,
      r.owner_name, r.owner_email, r.owner_phone, r.score ?? '', r.signals ?? {}, r.evidence_links ?? []
    ].map(escape).join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

