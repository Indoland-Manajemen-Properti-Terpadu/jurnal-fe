import type { StockOpname } from '@/module/inventory/domain/stockOpname';

export interface PrintLabels {
  countTitle: string;
  meta: (opname: StockOpname) => string;
  people: (opname: StockOpname) => string;
  cols: Record<'no' | 'product' | 'sku' | 'unit' | 'counted' | 'initial', string>;
  countNote: string;
  sign: { counter: string; witness: string };
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

/**
 * The count sheet to fill in by hand. It carries no book balance, so the counter stays blind. The
 * minutes of a posted count come from the server instead, so their figures match the ledger.
 */
export const buildOpnamePrint = (opname: StockOpname, labels: PrintLabels): string =>
  `<!doctype html><html><head><meta charset="utf-8"><title>${esc(labels.countTitle)}</title><style>${STYLE}</style></head><body>
    <h1>${esc(labels.countTitle)}</h1>
    <p class="meta">${esc(labels.meta(opname))}</p>
    <p class="meta">${esc(labels.people(opname))}</p>
    ${countSheet(opname, labels)}
  </body></html>`;

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
