# 📝 Document Q&A Bot  

An AI-powered web application that allows users to upload PDF documents, process them, and ask questions based on their content. The system extracts text, stores processed documents, and performs semantic search to retrieve relevant answers.

## 🚀 Features  

✅ Upload PDF documents (max 5 at a time, 10MB limit per file)  
✅ Extract and chunk text from uploaded files  
✅ Store processed documents in a database for retrieval  
✅ Select up to 3 processed documents for querying  
✅ Ask questions and get AI-generated answers  
✅ Smooth UI with real-time chat-like interaction  

---

## 🛠️ Tech Stack  

- **Frontend:** React, Tailwind CSS, Material UI, Axios  
- **Backend:** Node.js, Express, Multer (for file upload)  
- **Database:** MongoDB (storing processed documents)  
- **AI Processing:** Text chunking, semantic search (cosine similarity)  

---

## 📂 Project Structure 
``` 

📂 Chat-Doc
 │── 📂 server 
 │ │── 📂 config 
 │ │ ├── db.js # MongoDB connection 
 │ │── 📂 controllers 
 │ │ ├── documentController.js # Handles document upload, processing 
 │ │ ├── qaController.js # Handles Q&A retrieval 
 │ │── 📂 models 
 │ │ ├── Document.js # Mongoose schema for documents 
 │ │ ├── Chunk.js # Mongoose schema for text chunks 
 │ │── 📂 routes 
 │ │ ├── documentRoutes.js # Routes for document upload 
 │ │ ├── qaRoutes.js # Routes for Q&A 
 │ │── 📂 utils 
 │ │ ├── textEmbedder.js # Embeddings using sentence-transformers/all-MiniLM-L6-v2
 │ │ ├── textProcessor.js # Splitting text into chunks 
 │ │── server.js # Main Express server 
 │ |── .env # Environment variables 
 │── 📂 frontend 
 │ │── 📂 src 
 │ │ ├── 📂 components # React components (UI) 
 │ │ │ ├── Interface.jsx # Interface for uploading documents 
 │ │ ├── App.jsx # Main app entry point 
 │ │ ├── main.jsx # React DOM rendering (Vite) 
 │ │── 📂 public # Static files 
 │ │── index.html # Root HTML file 
 │── package.json # Dependencies 
 │── README.md # Documentation
```


---

## 🛠️ Installation  

```sh
git clone https://github.com/yourusername/document-qa-bot.git  
cd Chat-Doc  

# Install backend dependencies
cd server  
npm install  

# Install frontend dependencies
cd ../client  
npm install  

```

### Create a .env file in the backend/ folder and add:
MONGO_URI=mongodb+srv://your_mongo_url
PORT=5000

### Start the backend
```sh
cd backend  
node server.js  
```

### Start the frontend
```sh
cd frontend  
npm run dev  
```

---

## ⚡ API Endpoints  

### **📂 File Upload**
- **`POST /api/documents/upload`** → Upload and process PDFs  
  - **Request:** Multipart/form-data (file)  
  - **Response:** `{ message: "File uploaded successfully", documentId: "12345" }`  

- **`GET /api/documents`** → Fetch all processed documents  
  - **Response:** `[ { "id": "123", "name": "file1.pdf", "createdAt": "2024-02-04" } ]`  

---

### **🧠 Question & Answer**
- **`POST /api/qa/ask`** → Ask a question & get an AI-generated answer  
  - **Request:** `{ "question": "What is AI?", "documentIds": ["123", "456"] }`  
  - **Response:** `{ "answer": "AI stands for Artificial Intelligence." }`  

---

## 🚀 Features  

✅ **Upload PDF documents** (max 5 at a time, 10MB limit per file)  
✅ **Extract & chunk text** from uploaded files  
✅ **Store processed documents** in a MongoDB database  
✅ **Select up to 3 documents** for querying  
✅ **Ask questions** and get AI-powered responses  
✅ **Real-time Q&A** with a chat-like interface  
✅ **Optimized search** using cosine similarity  

---

## 📌 Upcoming Features  

🔹 **User authentication** to manage personal documents  
🔹 **Enhanced AI model** for better answers  
🔹 **Support for more file formats** (TXT, DOCX)  
🔹 **Deployment on AWS/Render**  

---

## 📝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

---

## 🔗 License
This project is not licensed.

Happy Coding! 🚀