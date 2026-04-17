import React, { useState, useRef, useEffect } from "react";

function App() {
const [question, setQuestion] = useState("");
const [messages, setMessages] = useState([]);
const [file, setFile] = useState(null);
const [loading, setLoading] = useState(false);

const chatEndRef = useRef(null);

// Auto-scroll
useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

// Clear chat
const clearChat = () => {
setMessages([]);
};

// Upload PDF
const uploadFile = async () => {
if (!file) {
alert("Please select a PDF file");
return;
}

const formData = new FormData();
formData.append("file", file);

try {
  const res = await fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  alert(data.message || "Upload done");
} catch (err) {
  console.error(err);
  alert("Upload failed");
}

};

// Ask Question
const askQuestion = async () => {
if (!question.trim()) return;

const userMsg = { type: "user", text: question };

setMessages((prev) => [
  ...prev,
  userMsg,
  { type: "bot", text: "" }
]);

setLoading(true);

try {
  const res = await fetch("http://localhost:3000/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  const data = await res.json();
  let text = data?.answer || "No response from server";

  setLoading(false);

  let index = 0;

  const typingInterval = setInterval(() => {
    index++;

    setMessages((prev) => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0) {
        newMsgs[newMsgs.length - 1].text = text.slice(0, index);
      }
      return newMsgs;
    });

    if (index >= text.length) {
      clearInterval(typingInterval);
    }
  }, 20);

} catch (err) {
  console.error(err);
  setLoading(false);

  setMessages((prev) => [
    ...prev,
    { type: "bot", text: "Error connecting to server ❌" }
  ]);
}

setQuestion("");

};

return (
  <div style={styles.page}>
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🤖 AI RAG Chatbot</h2>
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

        {loading && (
          <div style={styles.botWrapper}>
            <div style={styles.typing}>Typing...</div>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <div style={styles.inputBox}>
        <input
          style={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") askQuestion();
          }}
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

// Styles
const styles = {
page: {
background: "#eef2f7",
height: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
},
container: {
width: "420px",
height: "650px",
background: "#fff",
borderRadius: "16px",
boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
display: "flex",
flexDirection: "column",
padding: "15px",
},
header: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
},
title: {
margin: 0,
},
clearBtn: {
background: "#ff4d4f",
color: "#fff",
border: "none",
padding: "6px 10px",
borderRadius: "6px",
cursor: "pointer",
},
uploadBox: {
display: "flex",
justifyContent: "space-between",
margin: "10px 0",
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
borderRadius: "10px",
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
padding: "10px 14px",
borderRadius: "16px",
margin: "5px 0",
maxWidth: "75%",
},
botMsg: {
background: "#e5e7eb",
padding: "10px 14px",
borderRadius: "16px",
margin: "5px 0",
maxWidth: "75%",
},
inputBox: {
display: "flex",
gap: "8px",
},
input: {
flex: 1,
padding: "10px",
borderRadius: "10px",
border: "1px solid #ccc",
},
sendBtn: {
background: "#28a745",
color: "#fff",
border: "none",
padding: "10px",
borderRadius: "10px",
cursor: "pointer",
},
typing: {
fontStyle: "italic",
color: "#666",
background: "#e5e7eb",
padding: "8px 12px",
borderRadius: "12px",
margin: "5px 0",
},
};

export default App;