const express = require("express");
const { answerQuestion } = require("../controllers/q&aController.js");

const router = express.Router();

router.post("/ask", answerQuestion);

module.exports = router;
