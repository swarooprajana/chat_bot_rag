const express = require("express");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const multer = require("multer");
const cors = require("cors");
require("dotenv").config();


const OpenAI = require("openai");

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory document store
let documents = [];

/**
 * 📤 Upload PDF
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    documents.push(pdfData.text);

    res.json({
      message: "File uploaded & processed successfully",
      length: pdfData.text.length,
    });
  } catch (err) {
  console.error(err); // ADD THIS
  res.status(500).json({ error: err.message });
}
});

/**
 * ❓ Ask Question (RAG)
 */
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const context = documents.join("\n");

    // Simple keyword-based search
    const sentences = context.split("."); // break into sentences

    const keywords = question.toLowerCase().split(" ");

    const matched = sentences.filter((sentence) => {
      return keywords.some((word) =>
        sentence.toLowerCase().includes(word)
      );
    });

    if (matched.length === 0) {
      return res.json({
        answer: "No relevant information found in document.",
      });
    }

    // Return top 3 matching lines
    const answer = matched.slice(0, 3).join(". ");

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
/**
 * 🧹 Clear Docs (optional)
 */
app.delete("/clear", (req, res) => {
  documents = [];
  res.json({ message: "Documents cleared" });
});

/**
 * 🚀 Start Server
 */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
app.get("/", (req, res) => {
  res.send("RAG Chatbot API is running 🚀");
});