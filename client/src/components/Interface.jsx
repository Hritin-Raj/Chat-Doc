import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Upload, Send, FileText, Play, Delete } from "lucide-react";
import {
  Button,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const DocumentQABot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [questions]);

  const handleFileUpload = (event) => {
    const newFile = event.target.files[0];
    if (!newFile) return;

    if (newFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    if (newFile.type !== "application/pdf") {
      alert("Only PDF files are supported");
      return;
    }

    if (uploadedFiles.length >= 5) {
      alert("You can upload a maximum of 5 documents.");
      return;
    }

    setUploadedFiles((prev) => [...prev, newFile]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) return alert("No files to process");

    setProcessing(true);
    const formData = new FormData();

    uploadedFiles.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setProcessedFiles(response.data.documents);
        setUploadedFiles([]); // Clear uploaded files after processing
      } else {
        alert("Error processing files");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload and process files");
    } finally {
      setProcessing(false);
    }
  };

  const toggleFileSelection = (file) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== file));
    } else {
      if (selectedFiles.length < 3) {
        setSelectedFiles([...selectedFiles, file]);
      } else {
        alert("You can select up to 3 documents at a time");
      }
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion.trim() || selectedFiles.length === 0) return;

    setQuestions([...questions, currentQuestion]);

    const formData = {
      question: currentQuestion,
      documentIds: selectedFiles.map((file) => file.id), // Extract document IDs
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/qa/ask",
        formData
      );
      if (response.data.success) {
        setAnswers([...answers, response.data.answer]);
      } else {
        setAnswers([...answers, "Failed to retrieve answer"]);
      }
    } catch (error) {
      console.error("Question failed:", error);
      setAnswers([...answers, "Error retrieving answer"]);
    }

    setCurrentQuestion("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Processed Files */}
      <div className="w-64 bg-white border-r p-4">
        <Typography variant="h6">Documents</Typography>
        {processedFiles.map((file, index) => (
          <div
            key={index}
            className={`p-2 rounded cursor-pointer ${
              selectedFiles.includes(file) ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
            onClick={() => toggleFileSelection(file)}
          >
            <FileText className="h-4 w-4 inline-block mr-2" />
            {file.name}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <Card>
          <CardContent>
            <Typography variant="h5">Document Q&A Bot</Typography>
            <Typography variant="body2" color="textSecondary">
              Upload PDFs and ask questions about their content.
            </Typography>
            <div className="border-2 border-dashed rounded-lg p-4 mt-4">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Upload />}
                disabled={uploadedFiles.length >= 5}
              >
                Upload PDF ({uploadedFiles.length}/5)
              </Button>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <Typography variant="subtitle1">Uploaded Files</Typography>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between p-2 border rounded mt-2"
                  >
                    <span>{file.name}</span>
                    <Button onClick={() => removeFile(index)}>
                      <Delete className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Process Button */}
            {uploadedFiles.length > 0 && (
              <Button
                onClick={processFiles}
                disabled={processing}
                startIcon={
                  processing ? <CircularProgress size={20} /> : <Play />
                }
                className="mt-4"
              >
                {processing ? "Processing..." : "Process Files"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="overflow-auto flex-1 mb-4">
            {questions.map((question, index) => (
              <div key={index} className="p-2">
                <Typography variant="body1">Q: {question}</Typography>
                <Typography variant="body2" color="primary">
                  A: {answers[index] || "Loading..."}
                </Typography>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleQuestionSubmit} className="flex gap-2">
            <TextField
              fullWidth
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder={
                selectedFiles.length > 0
                  ? "Ask a question..."
                  : "Select a document first"
              }
              disabled={selectedFiles.length === 0}
            />
            <Button
              type="submit"
              disabled={selectedFiles.length === 0}
              variant="contained"
            >
              <Send />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentQABot;
