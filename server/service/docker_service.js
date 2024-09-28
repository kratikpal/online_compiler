const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

async function runCppCode(req, res) {
  const { code } = req.body; // Get the C++ code from the request
  console.log(`code: ${code}`);

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.cpp");
  fs.writeFileSync(userCodeFilePath, code);

  // Resolve the path for Docker volume mount
  const resolvedPath = path.resolve(__dirname);

  // Run the Docker container
  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" cpp-compiler`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).send(`Error: ${stderr}`);
      }
      res.json({ result: stdout }); // Send the output back to the user
    }
  );
}

async function runPythonCode(req, res) {
  const { code } = req.body; // Get the Python code from the request
  console.log(`code: ${code}`);

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.py");
  fs.writeFileSync(userCodeFilePath, code);

  // Resolve the path for Docker volume mount
  const resolvedPath = path.resolve(__dirname);

  // Run the Docker container
  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" python-compiler`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).send(`Error: ${stderr}`);
      }
      res.json({ result: stdout }); // Send the output back to the user
    }
  );
}

module.exports = { runCppCode, runPythonCode };
