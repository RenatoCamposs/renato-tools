# 🚀 Quick Start - Deploy em 10 Minutos

## ✅ Projeto 100% Implementado!

Tudo pronto para deploy. Siga esses passos simples:

---

## 1️⃣ Configurar Clerk (2 min)

```bash
# 1. Acesse: https://clerk.com
# 2. Sign up grátis
# 3. Criar app "Infinite Board"
# 4. Copiar keys e colar no .env.local:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_sua_key
CLERK_SECRET_KEY=sk_test_sua_key
```

---

## 2️⃣ Testar Localmente (1 min)

```bash
npm run dev
# Abrir http://localhost:3000
```

**Testar:**
- ✅ Double-click no canvas → cria card
- ✅ Criar pasta → expande com burst
- ✅ Arrastar cards

---

## 3️⃣ GitHub (2 min)

```bash
# Via GitHub CLI (mais fácil)
gh auth login
gh repo create infinite-board-app --public --source=. --remote=origin --push

# OU manualmente:
# 1. Criar repo em https://github.com/new
# 2. Rodar:
git remote add origin https://github.com/SEU_USER/infinite-board-app.git
git branch -M main
git push -u origin main
```

---

## 4️⃣ Vercel Deploy (3 min)

```bash
# Via CLI (mais fácil)
npm install -g vercel
vercel login
vercel --prod

# OU via Dashboard:
# 1. Acessar https://vercel.com
# 2. Import Git Repository
# 3. Escolher infinite-board-app
# 4. IMPORTANTE: Adicionar Environment Variables:
#    - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
#    - CLERK_SECRET_KEY
#    - NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
#    - NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
#    - NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/board
#    - NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/board
# 5. Deploy!
```

---

## 🎉 Pronto!

Seu app estará live em: `https://infinite-board-app.vercel.app`

---

## 📚 Mais Informações

- **Setup Completo:** [SETUP-INSTRUCTIONS.md](./SETUP-INSTRUCTIONS.md)
- **Deploy Detalhado:** [docs/DEPLOYMENT-GUIDE.md](./docs/DEPLOYMENT-GUIDE.md)
- **PRD:** [docs/PRD.md](./docs/PRD.md)
- **Component Specs:** [docs/COMPONENT-SPECS.md](./docs/COMPONENT-SPECS.md)
