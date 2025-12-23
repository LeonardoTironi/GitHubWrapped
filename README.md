# GitHub Wrapped 2025

Uma aplicação web que gera um "Wrapped" visual das suas estatísticas de desenvolvimento no GitHub em 2025.

## 📋 Sobre o Projeto

O GitHub Wrapped permite que você visualize suas métricas de desenvolvimento em 2025:

- Total de commits e streak máximo
- Linguagens mais utilizadas
- Repositórios criados
- Categorização do seu estilo de commit (Arquiteto vs Poeta)
- Geração de imagem PNG para compartilhamento

## 🚀 Tech Stack

- **Framework**: Next.js 16
- **Autenticação**: NextAuth.js com GitHub Provider
- **API Client**: @octokit/core (GraphQL)
- **Estilização**: Tailwind CSS
- **Geração de Imagem**: Satori + @resvg/resvg-js
- **Tipografia**: Mona Sans (GitHub Official)

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd github-wrapped
```

### 2. Instale as dependências base

```bash
npm install
```

### 3. Instale as dependências adicionais do projeto

```bash
npm install next-auth@beta @octokit/core satori @resvg/resvg-js
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` e configure:

1. **Crie uma OAuth App no GitHub**:

   - Acesse: https://github.com/settings/developers
   - Clique em "New OAuth App"
   - Application name: `GitHub Wrapped Local` (ou outro nome)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copie o **Client ID** e **Client Secret**

2. **Preencha as variáveis**:

```env
GITHUB_ID=seu_client_id_aqui
GITHUB_SECRET=seu_client_secret_aqui
NEXTAUTH_SECRET=gere_um_hash_aleatorio_aqui
NEXTAUTH_URL=http://localhost:3000
```

Para gerar o `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📂 Estrutura do Projeto

```
app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts          # Configuração NextAuth
│   └── generate-wrapped/
│       └── route.ts              # Geração da imagem
├── components/
│   └── WrappedCard.tsx          # Componente visual do card
├── lib/
│   ├── github-query.ts          # Query GraphQL
│   └── stats-processor.ts       # Processamento de métricas
├── wrapped/
│   └── page.tsx                 # Página de resultado
├── globals.css
├── layout.tsx
└── page.tsx                     # Landing page
```

## 🔧 Funcionalidades Implementadas

### Fase 1: Autenticação ✅

- [x] GitHub OAuth com scopes `read:user` e `repo`
- [x] Armazenamento do accessToken na sessão

### Fase 2: Coleta de Dados ✅

- [x] Query GraphQL para contribuições, PRs e commits
- [x] Análise de linguagens de programação
- [x] Amostragem de commits para auditoria
- [x] Cálculo de seguidores e repositórios

### Fase 3: Processamento ✅

- [x] Cálculo de Streak (dias consecutivos)
- [x] Auditoria de Conventional Commits
- [x] Categorização: Arquiteto vs Poeta
- [x] Top 5 linguagens mais utilizadas

### Fase 4: Geração de Imagem ✅

- [x] Componente React para Satori
- [x] Conversão SVG para PNG
- [x] Download e compartilhamento

## 🎨 Design

O design segue a identidade visual do GitHub:

- Paleta de cores escura (#0d1117)
- Tipografia Mona Sans
- Gradientes roxos e violetas
- Barras de progresso para linguagens

## 📝 Notas de Desenvolvimento

- **Conventional Commits**: Mensagens que seguem o padrão `tipo(escopo): descrição`
- **Rate Limit**: Tratamento de erros da API do GitHub
- **Privacidade**: Opção futura para ocultar nomes de repositórios privados

## 🚀 Próximos Passos

- [ ] Implementar cálculo de Peak Hour (horário de pico)
- [ ] Adicionar animações de loading
- [ ] Implementar cache de imagens geradas
- [ ] Deploy em produção (Vercel)
- [ ] Suporte a múltiplos anos

## 📄 Licença

Este projeto é de código aberto para fins educacionais.
