import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Upload, Send, FileText, Play, Delete, Loader } from "lucide-react";
import {
  Button,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Alert,
} from "@mui/material";

const DocumentQABot = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [processingError, setProcessingError] = useState("");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/documents/fetch")
      .then(response => setProcessedFiles(response.data.documents))
      .catch(error => console.error("Error fetching documents:", error));
  }, []);
  

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
    if (!["application/pdf", "text/plain"].includes(newFile.type)) {
      alert("Only PDF and TXT files are supported");
      return;
    }

    if (uploadedFiles.length >= 5) {
      alert("You can upload a maximum of 5 documents.");
      return;
    }

    setUploadedFiles((prev) => [...prev, newFile]);
    // Clear the input value to allow uploading the same file again
    event.target.value = null;
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      setProcessingError("No files to process");
      return;
    }

    setProcessing(true);
    setProcessingError("");
    const formData = new FormData();

    uploadedFiles.forEach((file) => {
      formData.append("documents", file); // Make sure this matches your backend expectation
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      // Update processed files with the response data
      const newProcessedFiles = response.data.documents.map((doc) => ({
        id: doc.documentId,
        name: doc.name,
        textLength: doc.textLength,
        chunksCount: doc.chunksCount,
      }));

      setProcessedFiles((prev) => [...prev, ...newProcessedFiles]);
      setUploadedFiles([]); // Clear uploaded files after successful processing
      setProcessingError("");
    } catch (error) {
      console.error("Processing failed:", error);
      setProcessingError(
        error.response?.data?.error ||
          "Failed to process files. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const toggleFileSelection = (file) => {
    setSelectedFiles((prev) => {
      if (prev.find((f) => f.id === file.id)) {
        return prev.filter((f) => f.id !== file.id);
      } else {
        if (prev.length >= 3) {
          alert("You can select up to 3 documents at a time");
          return prev;
        }
        return [...prev, file];
      }
    });
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
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="mb-4">
          <Typography variant="h6" className="mb-2">
            Processed Documents
          </Typography>
          {processedFiles.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No documents processed yet
            </Typography>
          ) : (
            processedFiles.map((file) => (
              <div
                key={file.id || file._id}  // Ensure the key is unique
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                  selectedFiles.find((f) => f.id === file.id)
                    ? "bg-blue-100 border border-blue-300"
                    : "hover:bg-gray-100 border border-gray-200"
                }`}
                onClick={() => toggleFileSelection(file)}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  <div>
                    <Typography variant="body2" className="font-medium">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {file.chunksCount} chunks
                    </Typography>
                  </div>
                </div>
              </div>
            ))
            
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4">
        <Card>
          <CardContent>
            <Typography variant="h5" className="mb-2">
              Document Q&A Bot
            </Typography>

            {/* File Upload Section */}
            <div className="border-2 border-dashed rounded-lg p-4 mt-4">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf, .txt"
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<Upload />}
                disabled={processing || uploadedFiles.length >= 5}
              >
                Upload PDF/TXT ({uploadedFiles.length}/5)
              </Button>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <Typography variant="subtitle1">Ready to Process</Typography>
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded mt-2"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{file.name}</span>
                    </div>
                    <Button
                      onClick={() => removeFile(index)}
                      disabled={processing}
                    >
                      <Delete className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Process Button and Error Message */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="contained"
                  onClick={processFiles}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? (
                    <div className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Processing Files...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Play className="h-5 w-5 mr-2" />
                      Process Files
                    </div>
                  )}
                </Button>
                {processingError && (
                  <Alert severity="error" className="mt-2">
                    {processingError}
                  </Alert>
                )}
              </div>
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
