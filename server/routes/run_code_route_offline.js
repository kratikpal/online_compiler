const express = require("express");
const router = express.Router();
const {
  runCppCode,
  runPythonCode,
  runJavaCode,
  runJsCode,
} = require("../service/docker_offline_service");

router.post("/cpp", runCppCode);

router.post("/python", runPythonCode);

router.post("/java", runJavaCode);

router.post("/javascript", runJsCode);

module.exports = router;
