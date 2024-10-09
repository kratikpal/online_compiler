const express = require("express");
const router = express.Router();
const { runCppCode } = require("../service/docker_cpp_service");
const { runPythonCode } = require("../service/docker_python_service");

router.post("/cpp", runCppCode);

router.post("/python", runPythonCode);

module.exports = router;
