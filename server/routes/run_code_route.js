const express = require("express");
const router = express.Router();
const { runCppCode, runPythonCode } = require("../service/docker_service");

router.post("/cpp", runCppCode);

router.post("/python", runPythonCode);

module.exports = router;
