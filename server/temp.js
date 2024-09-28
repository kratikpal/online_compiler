const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint to run user C++ code
app.post("/run-code", (req, res) => {
  const { code } = req.body; // Get the C++ code from the request
  console.log(code);

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
        return res.status(500).send(`Error: ${stderr}`);
      }
      res.json({ output: stdout }); // Send the output back to the user
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Sample JSON request body:
// {
//     "user": "user123"
//     "code": "#include <iostream>\nint main() { std::cout << \"Hello, World!\"; return 0; }"
// }
