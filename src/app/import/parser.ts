export interface ParsedItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  selected: boolean;
}

export function parseOFXorCSV(content: string, defaultCategoryId: string): ParsedItem[] {
  const lines = content.split('\n');
  const items: ParsedItem[] = [];

  // Check if OFX format
  if (content.includes('<STMTTRN>') || content.includes('<OFX>')) {
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    let match;
    let idx = 1;

    while ((match = trnRegex.exec(content)) !== null) {
      const block = match[1];
      const typeMatch = block.match(/<TRNTYPE>(.*)/i);
      const dateMatch = block.match(/<DTPOSTED>(\d{8})/i);
      const amountMatch = block.match(/<TRNAMT>([-\d.,]+)/i);
      const memoMatch = block.match(/<MEMO>(.*)/i) || block.match(/<NAME>(.*)/i);

      if (dateMatch && amountMatch) {
        const rawDate = dateMatch[1];
        const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
        const rawAmount = parseFloat(amountMatch[1].replace(',', '.'));
        const isExpense = rawAmount < 0 || (typeMatch && typeMatch[1].toUpperCase() === 'DEBIT');
        const absAmount = Math.abs(rawAmount);
        const desc = memoMatch ? memoMatch[1].trim() : `Lançamento ${idx}`;

        items.push({
          id: `import-${idx++}`,
          date: formattedDate,
          description: desc,
          amount: absAmount,
          type: isExpense ? 'expense' : 'income',
          categoryId: defaultCategoryId,
          selected: true,
        });
      }
    }
  } else {
    // CSV parsing (supports Date,Description,Amount or Data;Descricao;Valor)
    let idx = 1;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.includes(';') ? line.split(';') : line.split(',');
      if (cols.length >= 3) {
        const rawDate = cols[0].trim();
        const desc = cols[1].trim();
        const rawAmountStr = cols[2].replace(/[^\d.,-]/g, '').replace(',', '.');
        const num = parseFloat(rawAmountStr);

        if (!isNaN(num)) {
          let dateStr = rawDate;
          if (rawDate.includes('/')) {
            const parts = rawDate.split('/');
            if (parts.length === 3) {
              dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          items.push({
            id: `import-${idx++}`,
            date: dateStr,
            description: desc,
            amount: Math.abs(num),
            type: num < 0 ? 'expense' : 'income',
            categoryId: defaultCategoryId,
            selected: true,
          });
        }
      }
    }
  }

  return items;
}
