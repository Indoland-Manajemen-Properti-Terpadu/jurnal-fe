import type {
  JournalPreview,
  OpnameLine,
  OpnameReason,
  StockOpname,
} from '@/module/inventory/domain/stockOpname';

export type PrintKind = 'count' | 'record';

export interface PrintLabels {
  countTitle: string;
  recordTitle: string;
  meta: (opname: StockOpname) => string;
  people: (opname: StockOpname) => string;
  cols: Record<
    | 'no'
    | 'product'
    | 'sku'
    | 'unit'
    | 'counted'
    | 'initial'
    | 'book'
    | 'diff'
    | 'value'
    | 'reason'
    | 'account'
    | 'debit'
    | 'credit',
    string
  >;
  reason: (reason: OpnameReason) => string;
  countNote: string;
  noDiff: string;
  summary: (opname: StockOpname) => string;
  sign: { counter: string; witness: string; accounting: string; manager: string };
  money: (value: number) => string;
  qty: (value: number) => string;
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Everything a person typed goes through here, so a product name can never become markup. */
const esc = (value: string): string => value.replace(/[&<>"']/g, (char) => ESCAPES[char]);

const STYLE = `
  body { font: 9pt/1.5 Figtree, Arial, sans-serif; color: black; margin: 24px; }
  h1 { font-size: 14pt; margin: 0 0 4px; }
  .meta { color: dimgray; margin: 0 0 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid gray; padding: 5px 7px; text-align: left; vertical-align: top; }
  th { background: whitesmoke; }
  .num { text-align: right; white-space: nowrap; }
  .blank { height: 26px; }
  .sign { display: flex; gap: 40px; margin-top: 48px; }
  .sign > div { flex: 1; text-align: center; }
  .sign .line { border-top: 1px solid black; margin-top: 56px; padding-top: 4px; min-height: 18px; }
  @media print { body { margin: 12mm; } }
`;

const row = (cells: string[]): string => `<tr>${cells.join('')}</tr>`;
const th = (text: string, cls = ''): string => `<th class="${cls}">${esc(text)}</th>`;
const td = (text: string, cls = ''): string => `<td class="${cls}">${esc(text)}</td>`;

const countSheet = (opname: StockOpname, labels: PrintLabels): string => {
  const { cols } = labels;
  const head = row([
    th(cols.no),
    th(cols.product),
    th(cols.sku),
    th(cols.unit),
    th(cols.counted),
    th(cols.initial),
  ]);
  const body = opname.lines
    .map((line, index) =>
      row([
        td(String(index + 1), 'num'),
        td(line.name),
        td(line.sku),
        td(line.unit),
        '<td class="blank"></td>',
        '<td class="blank"></td>',
      ])
    )
    .join('');
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>
    <p class="meta">${esc(labels.countNote)}</p>
    <div class="sign">
      <div>${esc(labels.sign.counter)}<div class="line">${esc(opname.counterName ?? '')}</div></div>
      <div>${esc(labels.sign.witness)}<div class="line"></div></div>
    </div>`;
};

const diffRows = (lines: OpnameLine[]): OpnameLine[] =>
  lines.filter((line) => line.countedQty !== null && (line.diffQty ?? 0) !== 0);

const record = (opname: StockOpname, preview: JournalPreview | undefined, labels: PrintLabels) => {
  const { cols } = labels;
  const lines = diffRows(opname.lines);
  const head = row([
    th(cols.product),
    th(cols.book, 'num'),
    th(cols.counted, 'num'),
    th(cols.diff, 'num'),
    th(cols.value, 'num'),
    th(cols.reason),
  ]);
  const body =
    lines.length === 0
      ? `<tr><td colspan="6">${esc(labels.noDiff)}</td></tr>`
      : lines
          .map((line) => {
            const diff = line.diffQty ?? 0;
            const reason = line.reason ? labels.reason(line.reason) : '';
            return row([
              td(line.name),
              td(labels.qty(line.bookQty ?? 0), 'num'),
              td(labels.qty(line.countedQty ?? 0), 'num'),
              td(`${diff > 0 ? '+' : ''}${labels.qty(diff)}`, 'num'),
              td(labels.money(line.diffValue ?? 0), 'num'),
              td(line.note ? `${reason} - ${line.note}` : reason),
            ]);
          })
          .join('');
  const entries = preview?.entries ?? [];
  const journal =
    entries.length === 0
      ? ''
      : `<table><thead>${row([th(cols.account), th(cols.debit, 'num'), th(cols.credit, 'num')])}</thead><tbody>${entries
          .map((entry) =>
            row([
              td(`${entry.accountNumber} ${entry.accountName}`),
              td(entry.debit > 0 ? labels.money(entry.debit) : '', 'num'),
              td(entry.credit > 0 ? labels.money(entry.credit) : '', 'num'),
            ])
          )
          .join('')}</tbody></table>`;
  return `<table><thead>${head}</thead><tbody>${body}</tbody></table>
    <p class="meta" style="margin-top:10px">${esc(labels.summary(opname))}</p>
    ${journal}
    <div class="sign">
      <div>${esc(labels.sign.counter)}<div class="line">${esc(opname.counterName ?? '')}</div></div>
      <div>${esc(labels.sign.accounting)}<div class="line">${esc(opname.createdByName)}</div></div>
      <div>${esc(labels.sign.manager)}<div class="line"></div></div>
    </div>`;
};

/**
 * The page to print: a count sheet to fill in by hand (no book balance, so the counter stays blind)
 * or the minutes of a count with its differences, journal and signatures.
 */
export const buildOpnamePrint = (
  kind: PrintKind,
  opname: StockOpname,
  preview: JournalPreview | undefined,
  labels: PrintLabels
): string => {
  const title = kind === 'count' ? labels.countTitle : labels.recordTitle;
  const body = kind === 'count' ? countSheet(opname, labels) : record(opname, preview, labels);
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>
    <h1>${esc(title)}</h1>
    <p class="meta">${esc(labels.meta(opname))}</p>
    <p class="meta">${esc(labels.people(opname))}</p>
    ${body}
  </body></html>`;
};

/** Opens the page in a new window and prints it; false when the browser blocked the window. */
export const printHtml = (html: string): boolean => {
  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return false;
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
  return true;
};
