import * as XLSX from 'xlsx';
import { ColumnMeta, ColumnRole, ColumnType, QualityAlert, RawRow, SheetData } from '../types/analytics';

/**
 * Normalizes Brazilian currency and numbers:
 * "R$ 1.234,56" -> 1234.56
 * "1.234,56" -> 1234.56
 * "1234,56" -> 1234.56
 * "150%" -> 1.5
 */
export function parseBrazilianNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let str = String(val).trim();
  if (!str) return null;

  // Remove currency prefix R$, whitespace
  str = str.replace(/^R\$\s*/i, '').replace(/[\s\u00A0]/g, '');

  // Handle percentages
  const isPercent = str.endsWith('%');
  if (isPercent) {
    str = str.replace('%', '').trim();
  }

  // Handle Brazilian thousand dot and decimal comma: "1.234,56" -> "1234.56"
  if (str.includes(',') && str.includes('.')) {
    // Both present: assume "." is thousand separator and "," is decimal
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // Only comma present: assume comma is decimal separator
    str = str.replace(',', '.');
  }

  const num = parseFloat(str);
  if (isNaN(num)) return null;

  return isPercent ? num / 100 : num;
}

/**
 * Normalizes dates to YYYY-MM-DD format
 * Accepts Excel serials, DD/MM/YYYY, YYYY-MM-DD, etc.
 */
export function parseDateValue(val: any): string | null {
  if (val === null || val === undefined || val === '') return null;

  // Handle JS Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().split('T')[0];
  }

  // Handle Excel Serial number (e.g., 45200)
  if (typeof val === 'number') {
    if (val > 25000 && val < 60000) {
      const parsedDate = XLSX.SSF.parse_date_code(val);
      if (parsedDate) {
        const y = parsedDate.y;
        const m = String(parsedDate.m).padStart(2, '0');
        const d = String(parsedDate.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
  }

  const str = String(val).trim();
  if (!str) return null;

  // Pattern DD/MM/YYYY or DD-MM-YYYY
  const brMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (brMatch) {
    let day = parseInt(brMatch[1], 10);
    let month = parseInt(brMatch[2], 10);
    let year = parseInt(brMatch[3], 10);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Pattern YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Fallback JS Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return null;
}

export function formatBRCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatBRNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function formatBRDate(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Infer column type and guessed role based on name & values
 */
export function analyzeColumn(headerName: string, sampleValues: any[]): { type: ColumnType; role: ColumnRole } {
  const nameLower = headerName.toLowerCase().trim();

  // Guess role by header name (Portuguese retail context)
  let role: ColumnRole = 'ignore';
  if (nameLower.includes('data') || nameLower.includes('dia') || nameLower.includes('periodo') || nameLower.includes('mês') || nameLower.includes('mes')) {
    role = 'date';
  } else if (nameLower.includes('loja') || nameLower.includes('filial') || nameLower.includes('pdv') || nameLower.includes('unidade')) {
    role = 'store';
  } else if (nameLower.includes('categoria') || nameLower.includes('linha') || nameLower.includes('grupo') || nameLower.includes('setor')) {
    role = 'category';
  } else if (nameLower.includes('produto') || nameLower.includes('sku') || nameLower.includes('item') || nameLower.includes('descricao')) {
    role = 'product';
  } else if (nameLower.includes('venda') || nameLower.includes('faturamento') || nameLower.includes('receita') || nameLower.includes('valor_total') || nameLower.includes('realizado')) {
    role = 'sales';
  } else if (nameLower.includes('meta') || nameLower.includes('objetivo') || nameLower.includes('target')) {
    role = 'target';
  } else if (nameLower.includes('custo') || nameLower.includes('cmv') || nameLower.includes('despesa')) {
    role = 'cost';
  } else if (nameLower.includes('transac') || nameLower.includes('pedido') || nameLower.includes('cupom') || nameLower.includes('nf') || nameLower.includes('ticket')) {
    role = 'transaction_id';
  } else if (nameLower.includes('qtd') || nameLower.includes('quant') || nameLower.includes('volume') || nameLower.includes('unidades')) {
    role = 'quantity';
  }

  // Infer data type
  let validDateCount = 0;
  let validNumCount = 0;
  let nonNullCount = 0;

  for (const val of sampleValues) {
    if (val !== null && val !== undefined && val !== '') {
      nonNullCount++;
      if (parseDateValue(val)) validDateCount++;
      if (parseBrazilianNumber(val) !== null) validNumCount++;
    }
  }

  let type: ColumnType = 'string';
  if (nonNullCount > 0) {
    if (validDateCount / nonNullCount > 0.7) {
      type = 'date';
    } else if (validNumCount / nonNullCount > 0.7) {
      type = (role === 'sales' || role === 'target' || role === 'cost') ? 'currency' : 'number';
    }
  }

  return { type, role };
}

/**
 * Main XLSX/CSV File Reader & Auditor
 */
export async function parseFile(file: File): Promise<{ workbook: XLSX.WorkBook; sheetNames: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        resolve({ workbook, sheetNames: workbook.SheetNames });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts and audits sheet data from XLSX workbook
 */
export function extractSheetData(workbook: XLSX.WorkBook, sheetName: string): SheetData {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return {
      sheetName,
      rows: [],
      headers: [],
      columnsMeta: [],
      qualityAlerts: [{ id: 'empty', type: 'error', title: 'Aba vazia', description: 'Não foi possível ler dados desta aba.', count: 0 }],
      duplicateRowCount: 0
    };
  }

  const rawJson: RawRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });
  if (!rawJson.length) {
    return {
      sheetName,
      rows: [],
      headers: [],
      columnsMeta: [],
      qualityAlerts: [{ id: 'empty', type: 'warning', title: 'Nenhum registro encontrado', description: 'A aba selecionada não contém linhas de dados.', count: 0 }],
      duplicateRowCount: 0
    };
  }

  const headers = Object.keys(rawJson[0]);
  const columnsMeta: ColumnMeta[] = [];
  const qualityAlerts: QualityAlert[] = [];

  // Analyze each column
  headers.forEach((header) => {
    const sampleValues = rawJson.map(row => row[header]);
    const { type, role } = analyzeColumn(header, sampleValues);
    
    let nullCount = 0;
    let invalidCount = 0;

    sampleValues.forEach(val => {
      if (val === null || val === undefined || val === '') {
        nullCount++;
      } else if (role === 'date' && !parseDateValue(val)) {
        invalidCount++;
      } else if ((role === 'sales' || role === 'target' || role === 'cost' || role === 'quantity') && parseBrazilianNumber(val) === null) {
        invalidCount++;
      }
    });

    columnsMeta.push({
      name: header,
      guessedRole: role,
      inferredType: type,
      sampleValues: sampleValues.slice(0, 5),
      nullCount,
      invalidCount
    });

    if (nullCount > 0) {
      qualityAlerts.push({
        id: `null_${header}`,
        type: 'warning',
        title: `Valores ausentes em "${header}"`,
        description: `Existem ${nullCount} registro(s) sem preenchimento nesta coluna. Os registros foram mantidos.`,
        count: nullCount
      });
    }

    if (invalidCount > 0) {
      qualityAlerts.push({
        id: `invalid_${header}`,
        type: 'warning',
        title: `Formatos não reconhecidos em "${header}"`,
        description: `${invalidCount} registro(s) contêm texto ou caracteres fora do padrão esperado.`,
        count: invalidCount
      });
    }
  });

  // Check row duplicate count (without deleting)
  const rowStrings = new Set<string>();
  let duplicateRowCount = 0;

  rawJson.forEach(row => {
    const str = JSON.stringify(row);
    if (rowStrings.has(str)) {
      duplicateRowCount++;
    } else {
      rowStrings.add(str);
    }
  });

  if (duplicateRowCount > 0) {
    qualityAlerts.push({
      id: 'duplicates',
      type: 'info',
      title: 'Possíveis registros duplicados',
      description: `Identificadas ${duplicateRowCount} linha(s) idênticas no arquivo. Nenhuma linha foi removida automaticamente.`,
      count: duplicateRowCount
    });
  }

  return {
    sheetName,
    rows: rawJson,
    headers,
    columnsMeta,
    qualityAlerts,
    duplicateRowCount
  };
}
