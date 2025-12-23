# Instalação de Dependências - GitHub Wrapped

Este arquivo contém as instruções para instalar todas as dependências necessárias.

## Passo 1: Dependências Base (já instaladas)

```bash
npm install
```

## Passo 2: Dependências do Projeto

Execute o comando abaixo para instalar todas as dependências adicionais:

```bash
npm install next-auth@beta @octokit/core satori @resvg/resvg-js
```

### Detalhamento das Dependências:

- **next-auth@beta** (v5): Autenticação com GitHub OAuth
- **@octokit/core**: Cliente oficial do GitHub para chamadas GraphQL
- **satori**: Conversão de React components para SVG
- **@resvg/resvg-js**: Conversão de SVG para PNG

## Passo 3: Tipos TypeScript (Opcional)

Se necessário, instale os tipos para desenvolvimento:

```bash
npm install -D @types/node
```

## Verificação

Após a instalação, verifique se todas as dependências foram instaladas:

```bash
npm list next-auth @octokit/core satori @resvg/resvg-js
```

## Problemas Comuns

### Erro: Cannot find module 'next-auth'

Solução: Execute `npm install next-auth@beta`

### Erro com @resvg/resvg-js

Solução: Esta biblioteca pode precisar de rebuild:

```bash
npm rebuild @resvg/resvg-js
```

### Erro de permissão (Windows)

Solução: Execute o terminal como Administrador ou use:

```bash
npm install --legacy-peer-deps
```
