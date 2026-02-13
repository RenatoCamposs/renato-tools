# 🔐 Configurar Clerk para só você ter acesso

Assim **apenas você** consegue fazer login em `/secret-admin`; ninguém mais pode criar conta.

---

## Opção 1: Modo restrito + Allowlist (recomendado)

### 1. Abrir o Dashboard do Clerk
- Acesse: **https://dashboard.clerk.com**
- Selecione a aplicação do projeto (ex: **Renato Tools** / **supreme-warthog-36**)

### 2. Ativar modo restrito
- No menu lateral: **Configure** → **Restrictions** (ou **User & Authentication** → **Restrictions**)
- Ative **"Restricted mode"** (ou **"Enable restricted mode"**)
- Salve

Com isso, **só quem estiver na allowlist** pode se cadastrar.

### 3. Colocar só seu email na allowlist
- Na mesma página **Restrictions**, procure **Allowlist** (lista de permissão)
- Clique em **Add identifier** / **Add to allowlist**
- Adicione **apenas seu email** (ex: `seuemail@gmail.com`)
- Salve

Resultado: só esse email pode criar conta e, portanto, fazer login em `/secret-admin`.

### 4. (Opcional) Desativar sign-up público
- Em **Configure** → **Email, Phone, Username** (ou **Sign-up options**)
- Desative **"Allow sign ups"** ou deixe apenas **Email** como método e use **só a allowlist** como filtro

Assim você reforça que ninguém entra sem estar na lista.

---

## Opção 2: Só desativar sign-up

Se você **já é o único que criou conta**:

- Em **Configure** → **Sign-up** (ou opções de cadastro)
- Desative **"Allow new sign ups"** / **"Enable sign up"**

Ninguém novo consegue se cadastrar; só quem já tem conta (você) continua entrando.

---

## Resumo rápido

| O que você quer              | O que fazer no Clerk                                      |
|-----------------------------|------------------------------------------------------------|
| Só eu criar conta e entrar  | **Restrictions** → Restricted mode **ON** + Allowlist com **só seu email** |
| Ninguém novo se cadastrar   | **Sign-up** → **Allow sign ups** **OFF** (e manter sua conta) |

---

## Onde fica cada coisa no Dashboard

1. **Restrictions / Allowlist**  
   - Menu: **Configure** → **Restrictions**  
   - Ou: **User & Authentication** → **Restrictions**

2. **Sign-up (permitir ou bloquear cadastro)**  
   - **Configure** → **Email, Phone, Username** ou **Sign-up**

3. **Usuários existentes**  
   - **Users** → lista de contas; você pode apagar qualquer uma que não seja a sua.

---

## Depois de configurar

- **Você:** acessa `/secret-admin`, faz login com o email que está na allowlist → entra e pode criar/editar no board.
- **Outros:** não conseguem criar conta (e não têm como fazer login em `/secret-admin`). O board público continua só leitura para eles.

Se quiser, na allowlist você pode adicionar mais um ou dois emails (ex: outro da sua equipe) e manter o resto do mundo fora.
