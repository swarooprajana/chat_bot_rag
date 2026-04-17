# 🤖 DocuMind AI

**DocuMind AI** is a ChatGPT-like AI chatbot that allows users to upload PDF documents and ask questions based on their content using **RAG (Retrieval-Augmented Generation)**.

It supports **real-time streaming responses**, **chat history**, and a **modern ChatGPT-style UI**.

---

## 🚀 Features

* 📄 Upload PDF documents
* 💬 Ask questions about your document
* 🧠 Context-aware answers using RAG
* ⚡ Streaming responses (typing effect)
* 🗂️ Multiple chat sessions (like ChatGPT)
* 📝 Auto-generated chat titles
* 🧹 Clear chat option
* 📱 Responsive UI (mobile + desktop)

---

## 🏗️ Project Structure

```
chat_bot_rag/
│
├── frontend/              # React App
│   ├── src/
│   │   └── App.js
│   ├── package.json
│   └── node_modules/
│
├── backend/               # Node.js Server
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── node_modules/
│
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the project

```
git clone https://github.com/your-username/documind-ai.git
cd chat_bot_rag
```

---

### 2️⃣ Backend Setup

```
cd backend
npm install
```

Create `.env` file:

```
GROQ_API_KEY=your_api_key_here
```

Start backend:

```
node server.js
```

Server runs at:

```
http://localhost:3000
```

---

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm start
```

App runs at:

```
http://localhost:3001
```

---

## 🔁 How It Works

1. Upload a PDF 📄
2. Backend extracts text
3. Text is split into chunks
4. Relevant chunks are retrieved
5. Sent to LLM (Groq AI)
6. AI generates answer
7. Response streams to UI

---

## 🧠 RAG Flow

```
PDF → Text → Chunking → Retrieval → LLM → Streaming Response
```

---

## 🌍 API Endpoints

### 📤 Upload PDF

```
POST /upload
```

### 💬 Ask Question

```
POST /ask
```

Request body:

```
{
  "question": "What is this document about?"
}
```

---

## 🎨 UI Features

* Sidebar (Chat history)
* Chat bubbles (user & AI)
* Typing animation
* File upload + clear chat
* Chat title auto-update

---

## 🆓 Free AI Used

* Groq API (Free LLM inference)

---

## 🚀 Deployment (Free)

You can deploy:

* Frontend → Vercel / Netlify
* Backend → Render / Railway

---

## 🔮 Future Improvements

* 🔍 Vector DB (FAISS / Pinecone)
* 🔐 Authentication
* ☁️ Cloud file storage
* 🗑️ Delete chat
* ✏️ Rename chat
* 📊 Usage analytics

---

## 📌 Use Cases

* Students → Study PDFs faster
* Developers → Understand docs
* Professionals → Analyze reports
* Job seekers → Prepare notes

---

## 👨‍💻 Author

**Swaroop Rajana**
Full Stack Developer

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

## 🧠 Tagline

> **DocuMind AI — Chat with your documents**
