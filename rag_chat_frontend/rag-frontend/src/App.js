import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const clearChat = () => {
  setMessages([]);
  };

  const uploadFile = async () => {
    if (!file) return alert("Select a PDF");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    alert(data.message);
  };

 const askQuestion = async () => {
  if (!question) return;

  const userMsg = { type: "user", text: question };
  setMessages((prev) => [...prev, userMsg]);

  setLoading(true);

  const res = await fetch("http://localhost:3000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();

  setLoading(false);

  // Typing effect
  let text = data.answer;
  let index = 0;
  let temp = "";

  const typingInterval = setInterval(() => {
    temp += text[index];
    index++;

    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = {
        type: "bot",
        text: temp,
      };
      return newMsgs;
    });

    if (index === text.length) {
      clearInterval(typingInterval);
    }
  }, 20);

  // Add empty bot message first
  setMessages((prev) => [...prev, { type: "bot", text: "" }]);

  setQuestion("");
};

  return (
    <div style={styles.page}>
      <div style={styles.container}>
       <div style={styles.header}>
        <h2 style={styles.title}>🤖 RAG Chatbot</h2>
        <button style={styles.clearBtn} onClick={clearChat}>
          Clear
        </button>
      </div>
        

        {/* Upload */}
        <div style={styles.uploadBox}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button style={styles.uploadBtn} onClick={uploadFile}>
            Upload
          </button>
        </div>

        {/* Chat */}
        <div style={styles.chatBox}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={
                msg.type === "user"
                  ? styles.userWrapper
                  : styles.botWrapper
              }
            >
              <div
                style={
                  msg.type === "user"
                    ? styles.userMsg
                    : styles.botMsg
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {loading && (
          <div style={styles.botWrapper}>
            <div style={styles.typing}>Typing...</div>
          </div>
        )}
        {/* Input */}
        <div style={styles.inputBox}>
          <input
            style={styles.input}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your document..."
          />
          <button style={styles.sendBtn} onClick={askQuestion}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f4f6f8",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "420px",
    height: "600px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    padding: "15px",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
  },
  uploadBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  uploadBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  userWrapper: {
    display: "flex",
    justifyContent: "flex-end",
  },
  botWrapper: {
    display: "flex",
    justifyContent: "flex-start",
  },
  userMsg: {
    background: "#007bff",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "12px",
    margin: "5px 0",
    maxWidth: "70%",
  },
  botMsg: {
    background: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: "12px",
    margin: "5px 0",
    maxWidth: "70%",
  },
  inputBox: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  sendBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  typing: {
  fontStyle: "italic",
  color: "#666",
  background: "#e5e7eb",
  padding: "8px 12px",
  borderRadius: "12px",
  margin: "5px 0",
}
};

export default App;