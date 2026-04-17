require("dotenv").config();

const express = require("express");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const multer = require("multer");
const cors = require("cors");
const { pipeline } = require("@xenova/transformers");

const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

// 🔥 Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// In-memory storage
let storedChunks = [];
let embedder;

// 🔥 Load embedding model
async function loadModel() {
  console.log("Loading AI model...");
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("Model loaded ✅");
}
loadModel();

/**
 * 📤 Upload PDF
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;

    console.log("PDF length:", text.length);

    // Split into chunks
    const chunks = text.match(/(.|[\r\n]){1,500}/g);

    storedChunks = [];

    for (let chunk of chunks) {
      const embedding = await embedder(chunk, {
        pooling: "mean",
        normalize: true,
      });

      storedChunks.push({
        text: chunk,
        embedding: embedding.data,
      });
    }

    console.log("Stored chunks:", storedChunks.length);

    res.json({
      message: "File uploaded & embeddings created 🚀",
      chunks: storedChunks.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ❓ Ask Question (REAL RAG with Groq)
 */


app.post("/ask", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question) {
      return res.status(400).send("Question is required");
    }

    if (storedChunks.length === 0) {
      return res.send("Upload PDF first");
    }

    // 🔹 Embed question
    const qEmbedding = await embedder(question, {
      pooling: "mean",
      normalize: true,
    });

    // 🔹 Cosine similarity
    function cosineSimilarity(a, b) {
      let dot = 0, normA = 0, normB = 0;

      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }

      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // 🔹 Get top chunks
    const topChunks = storedChunks
      .map((c) => ({
        text: c.text,
        score: cosineSimilarity(qEmbedding.data, c.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((c) => c.text)
      .join("\n");

    // 🔥 Prepare messages
    const messages = [
      {
        role: "system",
        content:
          "Answer ONLY from context. If not found, say 'Not found in document'.",
      },
      ...history,
      {
        role: "user",
        content: `Context:\n${topChunks}\n\nQuestion: ${question}`,
      },
    ];

    // 🔥 IMPORTANT: streaming headers
   res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      stream: true,
    });

    // 🔥 Send chunks live
    for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      res.write(content); // ✅ ONLY THIS
    }
  }

    res.end();
  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).send("Server error");
  }
});
/**
 * 🧹 Clear
 */
app.delete("/clear", (req, res) => {
  storedChunks = [];
  res.json({ message: "Cleared successfully" });
});

/**
 * Root
 */
app.get("/", (req, res) => {
  res.send("RAG Chatbot with Groq is running 🚀");
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});