# Guia de Troubleshooting - GitHub Wrapped

## Problema: Nada aparece ao clicar em "Generate My Wrapped"

### 1. Verificar Console do Navegador

Abra o DevTools do navegador (F12) e vá para a aba **Console**. Os logs agora mostrarão:

- 🔄 Iniciando geração do Wrapped...
- 📊 Buscando estatísticas...
- ✅ Estatísticas recebidas
- 🎨 Gerando imagem...
- ✅ Blob recebido
- 🎉 Wrapped gerado com sucesso!

Ou erros como:

- ❌ Não autorizado
- ❌ Erro ao buscar estatísticas
- ❌ Erro ao gerar imagem

### 2. Verificar Aba Network

No DevTools, vá para **Network** e veja se as requisições para:

- `/api/stats` - Retorna 200 OK
- `/api/generate-wrapped` - Retorna 200 OK

### 3. Problemas Comuns

#### ❌ Erro 401 (Unauthorized)

**Causa:** Sessão expirada ou não autenticado  
**Solução:** Fazer logout e login novamente

#### ❌ Erro 429 (Too Many Requests)

**Causa:** Rate limit excedido  
**Solução:** Aguardar 1 minuto e tentar novamente

#### ❌ Erro 500 (Internal Server Error)

**Causa:** Erro no servidor ao processar dados  
**Soluções:**

- Verificar se o token do GitHub tem as permissões corretas (`read:user`, `repo`)
- Verificar logs do servidor para mais detalhes
- Pode ser falta de commits/dados no ano atual

#### ❌ Nada aparece sem erro

**Causa:** Problema de renderização ou estado  
**Solução:** Verificar se `hasGenerated` está sendo setado corretamente no console

### 4. Verificar Autenticação

Execute no console do navegador:

```javascript
fetch("/api/stats")
  .then((r) => r.json())
  .then((d) => console.log("Stats:", d))
  .catch((e) => console.error("Error:", e));
```

### 5. Limpar Cache

Limpe o sessionStorage:

```javascript
sessionStorage.clear();
```

E recarregue a página (Ctrl+Shift+R)

### 6. Verificar Variáveis de Ambiente

No servidor, certifique-se que:

- `GITHUB_ID` está configurado
- `GITHUB_SECRET` está configurado
- `NEXTAUTH_URL` aponta para a URL correta
- `NEXTAUTH_SECRET` está definido

### 7. Logs do Servidor

Se estiver rodando localmente (`npm run dev`), verifique o terminal do servidor para mensagens de erro.

### 8. Testar API Manualmente

Abra no navegador (com sessão ativa):

- `http://localhost:3000/api/stats`
- Deve retornar um JSON com suas estatísticas

### 9. Estado dos Componentes

No console do navegador, durante o processo, você pode verificar:

```javascript
// Ver estado atual
console.log({
  imageUrl: document.querySelector('[alt="GitHub Wrapped 2025"]')?.src,
  hasGenerated: sessionStorage.getItem("dev-wrapped-image") !== null,
});
```

## Ainda com problemas?

1. Abra uma issue no GitHub com:
   - Screenshot do console
   - Screenshot da aba Network
   - Logs do servidor (sem dados sensíveis)
   - Mensagem de erro exata
