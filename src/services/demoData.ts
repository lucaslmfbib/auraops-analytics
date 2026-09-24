import { ColumnMapping, RawRow, SheetData } from '../types/analytics';
import { extractSheetData } from './dataParser';
import * as XLSX from 'xlsx';

export function getDemoSheetData(): { sheetData: SheetData; mapping: ColumnMapping } {
  const demoRows: RawRow[] = [
    // Loja Barra Shopping - Perfumaria
    { Date: '2026-09-01', Store: 'Loja Barra Shopping', Category: 'Perfumaria', Product: 'Floratta Red Desodorante Colônia 75ml', Sales: 'R$ 159,90', Target: 'R$ 45.000,00', Cost: 'R$ 63,96', TransactionID: 'TX-1001', Quantity: 1 },
    { Date: '2026-09-01', Store: 'Loja Barra Shopping', Category: 'Perfumaria', Product: 'Malbec Gold Desodorante Colônia 100ml', Sales: 'R$ 219,90', Target: 'R$ 45.000,00', Cost: 'R$ 87,96', TransactionID: 'TX-1002', Quantity: 1 },
    { Date: '2026-09-02', Store: 'Loja Barra Shopping', Category: 'Cuidados com a Pele', Product: 'Botik Sérum Alta Potência Ácido Hialurônico 30ml', Sales: 'R$ 169,90', Target: 'R$ 45.000,00', Cost: 'R$ 67,96', TransactionID: 'TX-1003', Quantity: 1 },
    { Date: '2026-09-03', Store: 'Loja Barra Shopping', Category: 'Maquiagem', Product: 'Base Líquida Make B. Glycolic TX 30ml', Sales: 'R$ 109,90', Target: 'R$ 45.000,00', Cost: 'R$ 43,96', TransactionID: 'TX-1004', Quantity: 1 },
    { Date: '2026-09-04', Store: 'Loja Barra Shopping', Category: 'Perfumaria', Product: 'Elysée Eau de Parfum 50ml', Sales: 'R$ 279,90', Target: 'R$ 45.000,00', Cost: 'R$ 111,96', TransactionID: 'TX-1005', Quantity: 1 },
    { Date: '2026-09-05', Store: 'Loja Barra Shopping', Category: 'Corpo & Banho', Product: 'Loção Nativa SPA Ameixa Negra 400ml', Sales: 'R$ 79,90', Target: 'R$ 45.000,00', Cost: 'R$ 31,96', TransactionID: 'TX-1006', Quantity: 2 },
    { Date: '2026-09-06', Store: 'Loja Barra Shopping', Category: 'Perfumaria', Product: 'Lily Eau de Parfum 75ml', Sales: 'R$ 299,90', Target: 'R$ 45.000,00', Cost: 'R$ 119,96', TransactionID: 'TX-1007', Quantity: 1 },
    { Date: '2026-09-07', Store: 'Loja Barra Shopping', Category: 'Maquiagem', Product: 'Batom Make B. Hyaluronic 3.6g', Sales: 'R$ 59,90', Target: 'R$ 45.000,00', Cost: 'R$ 23,96', TransactionID: 'TX-1008', Quantity: 2 },

    // Loja Botafogo Praia - Perfumaria & Cuidados
    { Date: '2026-09-01', Store: 'Loja Botafogo Praia', Category: 'Perfumaria', Product: 'Zaad Santal Eau de Parfum 95ml', Sales: 'R$ 319,90', Target: 'R$ 38.000,00', Cost: 'R$ 127,96', TransactionID: 'TX-2001', Quantity: 1 },
    { Date: '2026-09-02', Store: 'Loja Botafogo Praia', Category: 'Cuidados com a Pele', Product: 'Botik Gel de Limpeza Facial 150g', Sales: 'R$ 54,90', Target: 'R$ 38.000,00', Cost: 'R$ 21,96', TransactionID: 'TX-2002', Quantity: 1 },
    { Date: '2026-09-03', Store: 'Loja Botafogo Praia', Category: 'Perfumaria', Product: 'Egeo Dolce Desodorante Colônia 90ml', Sales: 'R$ 139,90', Target: 'R$ 38.000,00', Cost: 'R$ 55,96', TransactionID: 'TX-2003', Quantity: 1 },
    { Date: '2026-09-04', Store: 'Loja Botafogo Praia', Category: 'Cabelos', Product: 'Shampoo Match Patrulha do Frizz 250ml', Sales: 'R$ 44,90', Target: 'R$ 38.000,00', Cost: 'R$ 17,96', TransactionID: 'TX-2004', Quantity: 2 },
    { Date: '2026-09-05', Store: 'Loja Botafogo Praia', Category: 'Perfumaria', Product: 'Coffee Woman Seduction 100ml', Sales: 'R$ 189,90', Target: 'R$ 38.000,00', Cost: 'R$ 75,96', TransactionID: 'TX-2005', Quantity: 1 },
    { Date: '2026-09-06', Store: 'Loja Botafogo Praia', Category: 'Corpo & Banho', Product: 'Sabonete Líquido Cuide-se Bem Nuvem 150ml', Sales: 'R$ 39,90', Target: 'R$ 38.000,00', Cost: 'R$ 15,96', TransactionID: 'TX-2006', Quantity: 3 },

    // Loja Centro Rua - Perfumaria & Maquiagem
    { Date: '2026-09-01', Store: 'Loja Centro Rua', Category: 'Perfumaria', Product: 'Quasar Classic Desodorante Colônia 100ml', Sales: 'R$ 149,90', Target: 'R$ 50.000,00', Cost: 'R$ 59,96', TransactionID: 'TX-3001', Quantity: 2 },
    { Date: '2026-09-02', Store: 'Loja Centro Rua', Category: 'Maquiagem', Product: 'Máscara de Cílios Intense Volume 10ml', Sales: 'R$ 49,90', Target: 'R$ 50.000,00', Cost: 'R$ 19,96', TransactionID: 'TX-3002', Quantity: 3 },
    { Date: '2026-09-03', Store: 'Loja Centro Rua', Category: 'Perfumaria', Product: 'Arbo Desodorante Colônia 100ml', Sales: 'R$ 149,90', Target: 'R$ 50.000,00', Cost: 'R$ 59,96', TransactionID: 'TX-3003', Quantity: 1 },
    { Date: '2026-09-04', Store: 'Loja Centro Rua', Category: 'Corpo & Banho', Product: 'Creme de Mãos Cuide-se Bem Deleite 50g', Sales: 'R$ 29,90', Target: 'R$ 50.000,00', Cost: 'R$ 11,96', TransactionID: 'TX-3004', Quantity: 4 },
    { Date: '2026-09-05', Store: 'Loja Centro Rua', Category: 'Perfumaria', Product: 'Insensatez Desodorante Colônia 100ml', Sales: 'R$ 139,90', Target: 'R$ 50.000,00', Cost: 'R$ 55,96', TransactionID: 'TX-3005', Quantity: 2 },

    // Loja Niterói Plaza - Perfumaria & Skincare
    { Date: '2026-09-01', Store: 'Loja Niterói Plaza', Category: 'Perfumaria', Product: 'Lily Le Parfum 50ml', Sales: 'R$ 349,90', Target: 'R$ 42.000,00', Cost: 'R$ 139,96', TransactionID: 'TX-4001', Quantity: 1 },
    { Date: '2026-09-02', Store: 'Loja Niterói Plaza', Category: 'Cuidados com a Pele', Product: 'Botik Ácido Glicólico 30ml', Sales: 'R$ 179,90', Target: 'R$ 42.000,00', Cost: 'R$ 71,96', TransactionID: 'TX-4002', Quantity: 1 },
    { Date: '2026-09-03', Store: 'Loja Niterói Plaza', Category: 'Perfumaria', Product: 'Malbec Black Desodorante Colônia 100ml', Sales: 'R$ 219,90', Target: 'R$ 42.000,00', Cost: 'R$ 87,96', TransactionID: 'TX-4003', Quantity: 1 },
    { Date: '2026-09-04', Store: 'Loja Niterói Plaza', Category: 'Maquiagem', Product: 'Paleta de Sombras Make B. 12 Cores', Sales: 'R$ 149,90', Target: 'R$ 42.000,00', Cost: 'R$ 59,96', TransactionID: 'TX-4004', Quantity: 1 },

    // Loja Copacabana Avenida
    { Date: '2026-09-01', Store: 'Loja Copacabana Avenida', Category: 'Perfumaria', Product: 'Floratta Simple Love Colônia 75ml', Sales: 'R$ 159,90', Target: 'R$ 35.000,00', Cost: 'R$ 63,96', TransactionID: 'TX-5001', Quantity: 1 },
    { Date: '2026-09-02', Store: 'Loja Copacabana Avenida', Category: 'Cabelos', Product: 'Máscara Match Pós-Química 250g', Sales: 'R$ 69,90', Target: 'R$ 35.000,00', Cost: 'R$ 27,96', TransactionID: 'TX-5002', Quantity: 2 },
    { Date: '2026-09-03', Store: 'Loja Copacabana Avenida', Category: 'Perfumaria', Product: 'Glamour Secrets Black 75ml', Sales: 'R$ 179,90', Target: 'R$ 35.000,00', Cost: 'R$ 71,96', TransactionID: 'TX-5003', Quantity: 1 }
  ];

  // Convert to XLSX workbook to generate real SheetData
  const ws = XLSX.utils.json_to_sheet(demoRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vendas_Setembro_Demo');

  const sheetData = extractSheetData(wb, 'Vendas_Setembro_Demo');

  const mapping: ColumnMapping = {
    dateCol: 'Date',
    storeCol: 'Store',
    categoryCol: 'Category',
    productCol: 'Product',
    salesCol: 'Sales',
    targetCol: 'Target',
    costCol: 'Cost',
    transactionCol: 'TransactionID',
    quantityCol: 'Quantity',
    metaGranularity: 'store_month'
  };

  return { sheetData, mapping };
}
