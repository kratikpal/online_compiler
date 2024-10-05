const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Run cpp code locally
async function runCppCode(req, res) {
  const { code, input } = req.body; // Get the C++ code from the request
  console.log(`code: ${code}`);

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.cpp");
  fs.writeFileSync(userCodeFilePath, code);

  // Save the user's input to a file
  const userInputFilePath = path.join(__dirname, "input.txt");
  fs.writeFileSync(userInputFilePath, input ?? "");

  // Resolve the path for Docker volume mount
  const resolvedPath = path.resolve(__dirname);

  // Run the Docker container
  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" cpp-compiler`,
    (error, stdout, stderr) => {
      // Delete the user's code file after execution
      try {
        const outputBinaryPath = path.join(__dirname, "output");
        if (fs.existsSync(outputBinaryPath)) {
          fs.unlinkSync(outputBinaryPath);
        }
        fs.unlinkSync(userInputFilePath);
        fs.unlinkSync(userCodeFilePath);
      } catch (unlinkError) {
        console.error(`Could not delete file: ${unlinkError.message}`);
      }

      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).json({ error: stderr });
      }
      res.json({ output: stdout }); // Send the output back to the user
    }
  );
}

async function runPythonCode(req, res) {
  const { code, input } = req.body; // Get the Python code from the request
  console.log(`code: ${code}`);

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.py");
  fs.writeFileSync(userCodeFilePath, code);

  // Save the user's input to a file
  const userInputFilePath = path.join(__dirname, "input.txt");
  fs.writeFileSync(userInputFilePath, input ?? "");

  // Resolve the path for Docker volume mount
  const resolvedPath = path.resolve(__dirname);

  // Run the Docker container
  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" python-compiler`,
    (error, stdout, stderr) => {
      try {
        fs.unlinkSync(userCodeFilePath);
        fs.unlinkSync(userInputFilePath);
      } catch (unlinkError) {
        console.error(`Could not delete file: ${unlinkError.message}`);
      }
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).json({ error: stderr });
      }
      res.json({ output: stdout }); // Send the output back to the user
    }
  );
}

async function runJavaCode(req, res) {
  const { code, input } = req.body; // Get the Java code from the request
  console.log(`code: ${code}`);

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.java");
  fs.writeFileSync(userCodeFilePath, code);

  // Save the user's input to a file
  const userInputFilePath = path.join(__dirname, "input.txt");
  fs.writeFileSync(userInputFilePath, input ?? "");

  // Resolve the path for Docker volume mount
  const resolvedPath = path.resolve(__dirname);

  // Run the Docker container
  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" java-compiler`,
    (error, stdout, stderr) => {
      // Delete the user's code and input files after execution
      try {
        fs.unlinkSync(userInputFilePath);
        fs.unlinkSync(userCodeFilePath);
        const user_code_class = path.join(__dirname, "user_code.class");
        if (fs.existsSync(user_code_class)) {
          fs.unlinkSync(user_code_class);
        }
      } catch (unlinkError) {
        console.error(`Could not delete file: ${unlinkError.message}`);
      }

      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).json({ error: stderr });
      }
      res.json({ output: stdout }); // Send the output back to the user
    }
  );
}

async function runJsCode(req, res) {
  const { code, input } = req.body;
  console.log(`Code: ${code}`);

  const userCodeFilePath = path.join(__dirname, "user_code.js");
  fs.writeFileSync(userCodeFilePath, code);

  const userInputFilePath = path.join(__dirname, "input.txt");
  fs.writeFileSync(userInputFilePath, input ?? "");

  const resolvedPath = path.resolve(__dirname);

  exec(
    `docker run --rm -v "${resolvedPath}:/usr/src/app" javascript-compiler node user_code.js`,
    (error, stdout, stderr) => {
      try {
        fs.unlinkSync(userCodeFilePath);
        fs.unlinkSync(userInputFilePath);
      } catch (unlinkError) {
        console.error(`Could not delete file: ${unlinkError.message}`);
      }

      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(400).json({ error: stderr });
      }
      res.json({ output: stdout });
    }
  );
}

module.exports = { runCppCode, runPythonCode, runJavaCode, runJsCode };
