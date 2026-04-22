# 🧠 NeuroDose

> Plataforma web para gestão clínica de pacientes com recomendações de tratamento baseadas em Inteligência Artificial.

🔗 **Demo ao vivo:** [neuro-dose.vercel.app](https://neuro-dose.vercel.app/)

---

## 📋 Sobre o Projeto

O **NeuroDose** é uma aplicação Full-Stack voltada para profissionais de saúde que precisam gerenciar pacientes e históricos clínicos de forma eficiente. O sistema conta com um módulo de IA que sugere tratamentos personalizados com base nos dados do paciente.

### ✨ Funcionalidades

- 📁 Cadastro e gestão de pacientes com histórico clínico completo
- 🤖 Recomendação de tratamentos personalizados via Inteligência Artificial
- 📸 Upload de fotos de pacientes (Firebase Storage)
- 🔐 Autenticação segura com email/senha e Google
- 📊 Dashboard em tempo real com dados atualizados via Realtime Database
- 🔒 Proteção de rotas — apenas usuários autenticados acessam o sistema

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Front-End | React + TypeScript + Vite |
| Estilização | Tailwind CSS + shadcn/ui |
| Autenticação | Firebase Authentication |
| Banco de Dados | Firebase Firestore + Realtime Database |
| Armazenamento | Firebase Storage |
| Deploy | Vercel |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Conta no [Firebase](https://console.firebase.google.com/)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (veja seção abaixo)

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

---

## 🔧 Configuração do Firebase

### 1. Criar o projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative os seguintes serviços:
   - **Authentication** → Sign-in method → habilite `Email/Password` e `Google`
   - **Firestore Database** → Criar banco de dados
   - **Realtime Database** → Criar banco de dados (anote a URL gerada)
   - **Storage** → Começar

### 2. Obter as credenciais

- No Firebase Console, vá em **Project Settings** (ícone de engrenagem)
- Role até **Your apps** → clique no ícone Web `</>`
- Copie as credenciais geradas

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=seu-app-id
```

### 4. Configurar Regras de Segurança

**Firestore:**
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

**Realtime Database:**
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

**Storage:**
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

---

## ❗ Solução de Problemas

<details>
<summary><strong>Erro no login com Google</strong></summary>

- Verifique se o método Google está **habilitado** em Authentication → Sign-in method
- Confirme que seu domínio está em Authentication → Settings → **Authorized domains**
- Para desenvolvimento local, use `http://localhost` (não acesse via IP)
- Se o popup for bloqueado, permita popups para `localhost` no seu navegador

</details>

<details>
<summary><strong>Erro ao carregar configurações</strong></summary>

- Verifique se o **Firestore Database** foi criado no Firebase Console
- Confirme que as regras de segurança foram publicadas corretamente
- Na primeira vez, o sistema usará valores padrão — isso é esperado

</details>

<details>
<summary><strong>Erro ao carregar ou salvar pacientes</strong></summary>

- Verifique se o **Realtime Database** está habilitado
- Confirme que as regras de segurança foram publicadas
- Verifique se você está autenticado no sistema
- Abra o Console do navegador (F12) para ver o erro detalhado

</details>

<details>
<summary><strong>Erro ao fazer upload de foto</strong></summary>

- Verifique se o **Firebase Storage** está habilitado
- O arquivo deve ser uma imagem (JPG, PNG ou GIF)
- Tamanho máximo: **5MB**
- Confirme que as regras de segurança do Storage foram publicadas

</details>

---

## 📁 Estrutura do Projeto

```
neuro-dose/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── lib/
│   │   └── firebase.ts # Configuração do Firebase
│   └── ...
├── .env                # Variáveis de ambiente (não versionar)
├── .env.example        # Exemplo de variáveis
└── README.md
```

---

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 👨‍💻 Autor

**Gabriel Maia** — Desenvolvedor Full-Stack

[![LinkedIn](https://img.shields.io/badge/LinkedIn-gabriel--maia-blue?style=flat&logo=linkedin)](https://linkedin.com/in/gabriel-maia-90b228289/)
[![GitHub](https://img.shields.io/badge/GitHub-Gbarielmito-black?style=flat&logo=github)](https://github.com/Gbarielmito)
[![Portfolio](https://img.shields.io/badge/Portfolio-ver%20projetos-green?style=flat)](https://portfolio-bice-theta-81.vercel.app/)
