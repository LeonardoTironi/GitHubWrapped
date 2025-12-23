# Checklist de Segurança - GitHub Wrapped

## ✅ Implementado

- [x] OAuth 2.0 com GitHub (NextAuth)
- [x] JWT em cookie httpOnly e Secure
- [x] Headers de segurança (CSP, HSTS, X-Frame-Options)
- [x] Rate limiting nas APIs
- [x] Middleware protegendo rotas autenticadas
- [x] Sanitização de erros
- [x] sessionStorage ao invés de localStorage
- [x] Validação de sessão em todas as APIs
- [x] Sem vulnerabilidades conhecidas (Snyk)
- [x] TypeScript com tipagem forte
- [x] Next.js Image para otimização segura

## ⚠️ Para Produção

### Crítico

- [ ] **Gerar AUTH_SECRET forte:**
  ```bash
  openssl rand -base64 32
  ```
- [ ] **Configurar NEXTAUTH_URL para domínio de produção:**

  ```env
  NEXTAUTH_URL=https://seu-dominio.com
  ```

- [ ] **Ajustar CSP para produção** (remover unsafe-eval se possível)

- [ ] **Configurar CORS apropriadamente** se tiver frontend separado

### Recomendado

- [ ] **Implementar logging e monitoramento:**
  - Sentry ou similar para erros
  - Datadog/New Relic para performance
- [ ] **Adicionar testes de segurança:**
  - OWASP ZAP scan
  - Penetration testing
- [ ] **Rate limiting baseado em Redis** (para múltiplos servidores):

  ```bash
  npm install @upstash/ratelimit @upstash/redis
  ```

- [ ] **Adicionar CAPTCHA** se houver abuso:

  - hCaptcha ou reCAPTCHA v3

- [ ] **Implementar rotação de secrets:**
  - Trocar AUTH_SECRET periodicamente
  - Rotação de GitHub OAuth credentials

### Opcional (Segurança Avançada)

- [ ] **Subresource Integrity (SRI)** para CDNs

- [ ] **Implementar WAF** (Web Application Firewall):
  - Cloudflare WAF
  - AWS WAF
- [ ] **Database Encryption** (se adicionar BD):

  - Encryption at rest
  - Encryption in transit

- [ ] **Audit Logging:**

  - Registrar acessos às APIs
  - Registrar mudanças de configuração

- [ ] **IP Whitelisting** para APIs administrativas

- [ ] **Implementar CSP Report-URI:**
  ```typescript
  report-uri https://seu-dominio.com/api/csp-report;
  ```

## 🧪 Testes de Segurança

### Automatizados

```bash
# Verificar vulnerabilidades
npm audit
npx snyk test

# Scan de segurança
npx eslint . --ext .ts,.tsx
```

### Manuais

1. **Testar XSS:**

   - Inserir `<script>alert('XSS')</script>` em inputs
   - Verificar se CSP bloqueia

2. **Testar CSRF:**

   - Fazer requests de origem diferente
   - Verificar se SameSite cookie bloqueia

3. **Testar autenticação:**

   - Acessar `/wrapped` sem login
   - Acessar `/api/stats` sem token

4. **Testar rate limiting:**

   - Fazer 20 requests rápidas
   - Verificar erro 429

5. **Verificar headers:**
   ```bash
   curl -I https://seu-dominio.com
   ```

## 📋 Checklist Pré-Deploy

- [ ] `AUTH_SECRET` configurado e forte
- [ ] `NEXTAUTH_URL` apontando para domínio correto
- [ ] `NODE_ENV=production`
- [ ] HTTPS habilitado
- [ ] Rate limiting testado
- [ ] Logs configurados
- [ ] Monitoring ativo
- [ ] Backups configurados (se houver BD)
- [ ] Variáveis de ambiente não commitadas
- [ ] .env.example atualizado
- [ ] Documentação de segurança revisada

## 🚨 Resposta a Incidentes

### Se detectar ataque:

1. **Isolar:** Desabilitar rota afetada
2. **Investigar:** Checar logs
3. **Mitigar:** Aplicar correção
4. **Comunicar:** Notificar usuários se necessário
5. **Revisar:** Atualizar políticas de segurança

### Contatos de Emergência

- Equipe de Segurança: [adicionar email]
- GitHub Security: security@github.com
- Vercel Security: security@vercel.com

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [GitHub OAuth Security](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#security-considerations)
