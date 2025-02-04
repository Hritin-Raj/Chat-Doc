const express = require("express");
const upload = require("../middlewares/multer.js")
const { uploadDocuments, fetchProcessedDocuments } = require("../controllers/documentController.js");

const router = express.Router();
router.post("/upload", upload.array("documents", 10), uploadDocuments);
router.get("/fetch", fetchProcessedDocuments);

module.exports = router;
