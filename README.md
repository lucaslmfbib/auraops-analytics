# AuraOps Analytics 🌿
> Plataforma Executiva de Análise de Dados e Inteligência Operacional para Varejo de Cosméticos

Plataforma web de análise preditiva e acompanhamento de indicadores operacionais (faturamento, atingimento de metas deduplicadas, ticket médio, margem bruta e rankings por loja e categoria), projetada para redes de varejo de cosméticos.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: React 19, TypeScript, HTML5
- **Estilização**: Tailwind CSS v3, Lucide Icons
- **Visualização de Dados**: Recharts (Gráficos dinâmicos de área, barras e share de categoria)
- **Ingestão & Leitura de Dados**: SheetJS (`xlsx`) para arquivos `.xlsx`, `.xls` e PapaParse para `.csv`
- **Compilação**: ESBuild / Vite

---

## 🚀 Como Executar Localmente

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/SEU_USUARIO/auraops-analytics.git
   cd auraops-analytics
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Gerar a compilação de produção (JS + CSS Tailwind)**:
   ```bash
   npm run build
   ```

4. **Iniciar o servidor local**:
   ```bash
   npm run start
   ```
   Acesse no seu navegador: **`http://localhost:3000`**

---

## ☁️ Como Publicar na Vercel

### Opção 1: Via Painel da Vercel (Recomendado)

1. Faça o push do projeto para o seu GitHub (repositório público ou privado).
2. Acesse o painel da [Vercel](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório `auraops-analytics`.
4. Mantenha as configurações padrão detectadas pela Vercel:
   - **Framework Preset**: Other / Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Clique em **Deploy**.

### Opção 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🔒 Segurança e Privacidade

- **Processamento 100% In-Browser**: Todos os arquivos de planilha enviados são lidos e processados localmente no navegador do usuário via JavaScript determinístico.
- Nenhum dado de cliente, faturamento ou vendas é enviado para servidores externos.

---

## 👨‍💻 Créditos

Desenvolvido por **Lucas Martins** (Engenharia de Software e Design de Produto).
