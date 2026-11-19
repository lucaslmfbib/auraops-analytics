# AuraOps Analytics

Painel executivo de indicadores operacionais para varejo de cosméticos (faturamento, metas, ticket médio, margem, rankings por loja/categoria). Todo o processamento é feito no navegador: as planilhas do usuário não são enviadas a nenhum servidor.

## Stack
React 19 + TypeScript, Tailwind CSS v3, Recharts, SheetJS (`xlsx`) e PapaParse para importação, PptxGenJS para exportar apresentações. Build com esbuild-wasm + Tailwind CLI; Vite disponível para desenvolvimento.

## Estrutura
- `src/App.tsx`, `src/main.tsx`: entrada e navegação entre módulos.
- `src/components/`: módulos de tela (Dashboard, Import, Presentation, Questions, Settings) e editores de gráfico/métrica.
- `src/services/`: regras de negócio, separadas da UI.
  - `analyticsEngine.ts`, `kpiRegistry.ts`: cálculo dos KPIs.
  - `dataParser.ts`, `columnMapper.ts`: leitura e mapeamento de colunas das planilhas.
  - `pptxExporter.ts`, `pptxParser.ts`, `chartImageExporter.ts`: exportação.
  - `settingsCascadeEngine.ts`: configurações em cascata.
  - `demoData.ts`: dados de demonstração.
- `src/types/analytics.ts`: tipos compartilhados.

## Como rodar
```bash
npm install
npm run dev                      # desenvolvimento (Vite)
npm run build && npm run start   # build de produção em dist/ + servidor em http://localhost:3000
```

## Convenções
- Manter o processamento 100% no navegador; não adicionar chamadas que enviem dados do usuário para fora sem pedido explícito.
- Cálculos novos vão em `src/services/`, não dentro dos componentes.
- Deploy na Vercel: build `npm run build`, saída `dist`.
- Variáveis de ambiente: ver `.env.example`. Nunca commitar chaves.
- Não há testes automatizados; validar com `npm run build` e conferindo o painel com os dados de demonstração.
