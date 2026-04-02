# Supabase — configurar o site

## 1. Projeto e credenciais

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → API**, copie **Project URL** e a chave **anon public**.
3. Copie `config.example.js` para `config.js` e preencha:

```javascript
window.FSSTORE_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
};
```

O arquivo `config.js` está no `.gitignore` para não subir chaves no Git.

## 2. Banco de dados

No **SQL Editor** do Supabase, execute o conteúdo de `supabase/schema.sql` (tabela `site_content` e políticas RLS).

## 3. Um único usuário (login)

1. Vá em **Authentication → Users → Add user**.
2. Crie o usuário com **e-mail** e **senha** (é o login do painel Admin no site).
3. Opcional: em **Authentication → Providers → Email**, desative **Confirm email** se quiser entrar sem confirmar o e-mail (útil só em ambiente controlado).

O site usa **E-mail + senha** do Supabase Auth (não há usuário fixo no código).

## 4. Servir o site

Abra o site por **HTTP** (não `file://`), para os módulos ES e o CDN do Supabase funcionarem. Exemplo:

```bash
npx serve .
```

Depois acesse a aba **Admin**, entre com o e-mail e a senha criados no passo 3 e use **Salvar alterações**. O conteúdo fica na tabela `site_content` e todos os visitantes veem a mesma versão.
