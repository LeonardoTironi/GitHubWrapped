1. Contexto do Projeto
   O objetivo é criar uma aplicação web (Next.js) onde o usuário faz login via GitHub (OAuth), o sistema consome a API GraphQL do GitHub para coletar métricas de 2025 e gera um "Wrapped" visual (PNG) que pode ser baixado.

2. Tech Stack Obrigatória
   Framework: Next.js 16

Autenticação: Auth.js (NextAuth) com GitHub Provider.

API Client: @octokit/core para chamadas GraphQL.

Estilização: Tailwind CSS.

Geração de Imagem: satori (HTML to SVG) e @resvg/resvg-js (SVG to PNG).

Tipografia: Mona Sans (GitHub Official).

3. Estrutura de Arquivos Sugerida
   Plaintext

/app
/api
/auth/[...nextauth]/route.ts <- Configuração de Auth & Scopes
/generate-wrapped/route.ts <- Lógica de extração e geração de imagem
/wrapped
page.tsx <- Exibição do resultado e botões de share
page.tsx <- Landing page com botão de Login
/components
WrappedCard.tsx <- Componente React que será convertido em imagem
/lib
github-query.ts <- A query GraphQL definida anteriormente
stats-processor.ts <- Funções p/ Streak, Audit e Peak Hour 4. Requisitos Funcionais
Fase 1: Autenticação
Configurar o GithubProvider com os scopes: read:user, repo.

Armazenar o accessToken no objeto session para que as rotas de API possam utilizá-lo.

Fase 2: Coleta de Dados (GraphQL)
Utilizar a query GraphQL para obter:

contributionsCollection: Total de commits, PRs e calendário.

repository.languages: Bytes de linguagens nos repositórios ativos.

user.repositories: Data de criação dos repositórios.

user.followers e user.following.

Audit Sample: Buscar os últimos 100 commits do usuário para validar o padrão Conventional Commits (Regex: ^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?: .+$).

Fase 3: Regras de Negócio (Processamento)
Cálculo de Streak: Iterar sobre contributionCalendar e encontrar a maior sequência de dias com contributionCount > 0.

Horário de Pico: Mapear a distribuição de horas dos commits (se disponível via query ou amostragem).

Categorização:

Se mensagens_padronizadas / total_commits_amostra >= 0.5: Arquiteto de Commits.

Caso contrário: Poeta do Software.

Fase 4: Geração de Imagem (Satori)
Criar um componente React que utilize apenas flex e div (limitação do Satori).

Integrar a fonte Mona Sans como buffer.

Retornar o buffer PNG com os headers: 'Content-Type': 'image/png'.

5. Instruções Adicionais para o Agente
   "Implemente uma barra de progresso visual para as linguagens usando Tailwind."

"Certifique-se de que nomes de repositórios privados possam ser ocultados se uma flag hide_repos for verdadeira."

"Trate erros de Rate Limit da API do GitHub retornando uma mensagem amigável ao usuário."

6. Variáveis de Ambiente (.env.local)
   Snippet de código

GITHUB_ID=seu_client_id
GITHUB_SECRET=seu_client_secret
NEXTAUTH_SECRET=um_hash_aleatorio
NEXTAUTH_URL=http://localhost:3000
