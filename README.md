# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase Authentication

## Configuração da Autenticação

Este projeto utiliza Firebase Authentication para gerenciar login e registro de usuários.

### Passos para configurar:

1. **Criar um projeto no Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto ou use um existente
   - Ative a autenticação no menu lateral (Authentication)

2. **Habilitar métodos de autenticação:**
   - Na seção Authentication, vá em "Sign-in method"
   - Habilite "Email/Password"
   - Habilite "Google" e configure o projeto OAuth

3. **Habilitar Firestore Database:**
   - No menu lateral, vá em "Firestore Database"
   - Clique em "Criar banco de dados"
   - Escolha o modo de produção ou teste (para desenvolvimento, pode usar o modo de teste)
   - Escolha uma localização para o banco de dados
   - Configure as regras de segurança (para desenvolvimento, pode usar regras permissivas temporariamente)

4. **Habilitar Realtime Database:**
   - No menu lateral, vá em "Realtime Database"
   - Clique em "Criar banco de dados"
   - Escolha o modo (teste ou produção)
   - Escolha uma localização
   - **Importante:** Anote a URL do banco de dados (ex: `https://neurodose-40e5e-default-rtdb.firebaseio.com`)
   - Configure as regras de segurança (veja abaixo)

5. **Habilitar Storage:**
   - No menu lateral, vá em "Storage"
   - Clique em "Começar"
   - Escolha o modo (teste ou produção)
   - Configure as regras de segurança (veja abaixo)

6. **Obter as credenciais:**
   - No projeto Firebase, vá em "Project Settings" (ícone de engrenagem)
   - Role até "Your apps" e clique em "Web" (ícone `</>`)
   - Copie as credenciais do Firebase

7. **Configurar variáveis de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
   ```
   VITE_FIREBASE_API_KEY=sua-api-key
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto-id
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=seu-app-id
   ```

8. **Iniciar o projeto:**
   ```sh
   npm run dev
   ```

### Funcionalidades de Autenticação:

- ✅ Login com email e senha
- ✅ Criação de conta com email e senha
- ✅ Login com Google
- ✅ Proteção de rotas (usuários não autenticados são redirecionados para login)
- ✅ Logout
- ✅ Persistência de sessão

### Troubleshooting - Erro no Login com Google:

Se você está recebendo erros ao tentar fazer login com Google, verifique:

1. **Google Sign-in está habilitado no Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Vá em Authentication > Sign-in method
   - Certifique-se de que "Google" está **habilitado** (não apenas visível)
   - Se não estiver, clique em "Google" e depois em "Enable"
   - Configure o email de suporte do projeto (obrigatório)

2. **Domínios autorizados:**
   - No Firebase Console, vá em Authentication > Settings
   - Role até "Authorized domains"
   - Certifique-se de que os seguintes domínios estão listados:
     - `localhost` (para desenvolvimento)
     - Seu domínio de produção (se aplicável)
   - Adicione domínios se necessário clicando em "Add domain"

3. **Bloqueio de popups:**
   - Se o navegador estiver bloqueando popups, você verá a mensagem "Popup bloqueado pelo navegador"
   - Permita popups para `localhost` ou seu domínio
   - No Chrome: Configurações > Privacidade e segurança > Configurações do site > Pop-ups e redirecionamentos

4. **Verificar console do navegador:**
   - Abra o DevTools (F12)
   - Vá na aba "Console"
   - Tente fazer login novamente
   - O erro completo será exibido no console com mais detalhes

5. **Erro "operation-not-allowed":**
   - Isso significa que o Google Sign-in não está habilitado
   - Siga o passo 1 acima

6. **Erro "unauthorized-domain":**
   - O domínio atual não está na lista de domínios autorizados
   - Se você está acessando por IP (ex: `192.168.57.1:8080`), adicione o IP aos domínios autorizados
   - No Firebase Console, vá em Authentication > Settings > Authorized domains
   - Clique em "Adicionar domínio" e adicione o IP ou domínio que você está usando
   - **Nota:** Se estiver usando `localhost`, certifique-se de acessar por `http://localhost:8080` e não por IP

### Troubleshooting - Erro ao Carregar Configurações:

Se você vê "Erro ao carregar configurações" na página de Configurações:

1. **Firestore não está habilitado:**
   - No Firebase Console, vá em "Firestore Database"
   - Se não houver banco de dados criado, clique em "Criar banco de dados"
   - Escolha o modo de produção ou teste
   - Escolha uma localização
   - **Importante:** Configure as regras de segurança para permitir leitura/escrita para usuários autenticados

2. **Regras de segurança do Firestore:**
   - No Firestore Database, vá em "Regras"
   - Para desenvolvimento, você pode usar regras temporárias:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   - Clique em "Publicar" para salvar as regras

3. **Primeira vez usando configurações:**
   - Se você ainda não salvou nenhuma configuração, é normal não haver dados
   - O sistema usará valores padrão automaticamente
   - Após salvar pela primeira vez, os dados serão carregados normalmente

### Configuração do Realtime Database e Storage:

**Regras de Segurança do Realtime Database:**
- No Realtime Database, vá em "Regras"
- Use as seguintes regras para desenvolvimento:
```json
{
  "rules": {
    "users": {
      "$userId": {
        "patients": {
          ".read": "$userId === auth.uid",
          ".write": "$userId === auth.uid"
        }
      }
    }
  }
}
```
- Clique em "Publicar" para salvar

**Regras de Segurança do Storage:**
- No Storage, vá em "Regras"
- Use as seguintes regras para desenvolvimento:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
- Clique em "Publicar" para salvar

**Nota sobre a URL do Realtime Database:**
- Se você precisar especificar uma URL customizada, adicione `databaseURL` na configuração do Firebase em `src/lib/firebase.ts`
- A URL geralmente está no formato: `https://[PROJECT_ID]-default-rtdb.[REGION].firebasedatabase.app`

### Troubleshooting - Erro ao Carregar/Salvar Pacientes:

Se você vê erros ao carregar ou salvar pacientes:

1. **Realtime Database não está habilitado:**
   - No Firebase Console, vá em "Realtime Database"
   - Se não houver banco de dados criado, clique em "Criar banco de dados"
   - Escolha o modo (teste ou produção)
   - Escolha uma localização
   - **Importante:** Configure as regras de segurança (veja acima)

2. **Primeira vez usando pacientes:**
   - Se você ainda não cadastrou nenhum paciente, é normal não haver dados
   - O sistema não mostrará erro, apenas uma lista vazia
   - Após cadastrar o primeiro paciente, os dados serão carregados normalmente

3. **Erro ao salvar paciente:**
   - Verifique se o Realtime Database está habilitado
   - Verifique as regras de segurança do Realtime Database
   - Verifique se você está logado
   - Abra o console do navegador (F12) para ver o erro específico

4. **Erro ao fazer upload de foto:**
   - Verifique se o Storage está habilitado
   - Verifique as regras de segurança do Storage
   - Certifique-se de que a imagem tem no máximo 5MB
   - Certifique-se de que o arquivo é uma imagem (JPG, PNG, GIF)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
