const express = require("express");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();

const { pipeline } = require("@xenova/transformers");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

// 🔥 Global variables
let embedder;
let storedChunks = [];

/**
 * 🧠 Load AI Model (IMPORTANT)
 */
async function loadModel() {
  console.log("Loading AI model...");
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  console.log("Model loaded ✅");
}

/**
 * 📤 Upload PDF → Convert to embeddings
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!embedder) {
      return res.json({ message: "Model still loading, try again..." });
    }

    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text;

    console.log("PDF length:", text.length);

    // Split text into chunks
    const chunks = text.match(/(.|[\r\n]){1,500}/g) || [];

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
      message: "File uploaded & processed with semantic embeddings 🚀",
      chunks: storedChunks.length,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔍 Cosine Similarity
 */
function cosineSimilarity(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * ❓ Ask Question (SEMANTIC RAG)
 */
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!embedder) {
      return res.json({ answer: "Model still loading..." });
    }

    if (storedChunks.length === 0) {
      return res.json({ answer: "Please upload a document first." });
    }

    // Convert question to embedding
    const qEmbedding = await embedder(question, {
      pooling: "mean",
      normalize: true,
    });

    // Compare with stored chunks
    const results = storedChunks.map((chunk) => ({
      text: chunk.text,
      score: cosineSimilarity(qEmbedding.data, chunk.embedding),
    }));

    // Sort by similarity
    results.sort((a, b) => b.score - a.score);

    // Get top 3 results
    const answer = results
      .slice(0, 3)
      .map((r) => r.text)
      .join("\n");

    res.json({ answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🧹 Clear Documents
 */
app.delete("/clear", (req, res) => {
  storedChunks = [];
  res.json({ message: "Documents cleared" });
});

/**
 * 🏠 Root
 */
app.get("/", (req, res) => {
  res.send("Semantic RAG Chatbot API running 🚀");
});

/**
 * 🚀 Start Server ONLY after model loads
 */
loadModel().then(() => {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});