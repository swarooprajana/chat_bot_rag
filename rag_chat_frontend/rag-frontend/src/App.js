import React, { useState } from "react";

function App() {
  const [chats, setChats] = useState([
    { id: 1, title: "New Chat", messages: [] }
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // 🆕 New Chat
  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: []
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  // 🧹 Clear Chat
  const clearChat = () => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === activeChatId
          ? { ...chat, messages: [] }
          : chat
      )
    );
  };

  // 📤 Upload PDF
  const uploadFile = async () => {
    if (!file) return alert("Select a PDF");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message || "Uploaded");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  // 💬 Ask Question (Streaming)
  const askQuestion = async () => {
    if (!question.trim()) return;

    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            { type: "user", text: question },
            { type: "bot", text: "" }
          ]
        };
      }
      return chat;
    });

    setChats(updatedChats);

    try {
      const response = await fetch("http://localhost:3000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          history: activeChat.messages.map(m => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.text
          }))
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value);
        fullText += chunk;

        setChats(prev =>
          prev.map(chat => {
            if (chat.id === activeChatId) {
              const msgs = [...chat.messages];
              msgs[msgs.length - 1].text = fullText;
              return { ...chat, messages: msgs };
            }
            return chat;
          })
        );
      }

    } catch (err) {
      console.error(err);
    }

    setQuestion("");
  };

  return (
    <div style={styles.app}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.newChatBtn} onClick={createNewChat}>
          + New Chat
        </button>

        {chats.map(chat => (
          <div
            key={chat.id}
            style={{
              ...styles.chatItem,
              background:
                chat.id === activeChatId ? "#2a2b32" : "transparent"
            }}
            onClick={() => setActiveChatId(chat.id)}
          >
            {chat.title}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={styles.main}>

        {/* 🔥 Header Controls */}
        <div style={styles.header}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button style={styles.uploadBtn} onClick={uploadFile}>
            Upload
          </button>

          <button style={styles.clearBtn} onClick={clearChat}>
            Clear Chat
          </button>
        </div>

        {/* Chat */}
        <div style={styles.chatBox}>
          {activeChat.messages.map((msg, i) => (
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

        {/* Input */}
        <div style={styles.inputBox}>
          <input
            style={styles.input}
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && askQuestion()}
            placeholder="Send a message..."
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
  app: {
    display: "flex",
    height: "100vh",
    background: "#343541",
    color: "#fff"
  },

  sidebar: {
    width: "250px",
    background: "#202123",
    padding: "10px"
  },

  newChatBtn: {
    padding: "10px",
    background: "#10a37f",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px"
  },

  chatItem: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    marginBottom: "5px"
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  header: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    borderBottom: "1px solid #555"
  },

  uploadBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },

  clearBtn: {
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },

  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto"
  },

  userWrapper: {
    display: "flex",
    justifyContent: "flex-end"
  },

  botWrapper: {
    display: "flex",
    justifyContent: "flex-start"
  },

  userMsg: {
    background: "#10a37f",
    padding: "10px 15px",
    borderRadius: "10px",
    margin: "5px",
    maxWidth: "60%"
  },

  botMsg: {
    background: "#444654",
    padding: "10px 15px",
    borderRadius: "10px",
    margin: "5px",
    maxWidth: "60%"
  },

  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #555"
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    background: "#40414f",
    color: "#fff"
  },

  sendBtn: {
    marginLeft: "10px",
    padding: "10px",
    background: "#10a37f",
    border: "none",
    color: "#fff",
    borderRadius: "6px"
  }
};

export default App;