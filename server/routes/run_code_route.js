const express = require("express");
const router = express.Router();
const { runCppCode } = require("../service/docker_cpp_service");

router.post("/cpp", runCppCode);

module.exports = router;
