const express = require("express");
const upload = require("../middlewares/multer.js")
const { uploadDocuments } = require("../controllers/documentController.js");

const router = express.Router();

// Upload and process multiple documents
router.post("/upload", upload.array("documents", 10), uploadDocuments);

// export default router;
module.exports = router;
