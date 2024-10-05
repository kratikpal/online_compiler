const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const ecs = new AWS.ECS({
  region: "ap-south-1",
});

const s3 = new AWS.S3();

async function runCppCode(req, res) {
  const { code, input } = req.body;

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.cpp");
  fs.writeFileSync(userCodeFilePath, code);

  // Save the user's input to a file
  const userInputFilePath = path.join(__dirname, "input.txt");
  fs.writeFileSync(userInputFilePath, input ?? "");

  // Save output and error files
  const outputFilePath = path.join(__dirname, "output.txt");
  fs.writeFileSync(outputFilePath, "");

  const errorFilePath = path.join(__dirname, "error.txt");
  fs.writeFileSync(errorFilePath, "");

  // S3 Bucket name and paths
  const bucketName = "kratikpalonlinecompiler";
  const userCodeKey = "user/user_code.cpp";
  const userInputKey = "user/input.txt";
  const outputKey = "user/output.txt";
  const errorKey = "user/error.txt";

  // Upload the user's code and input to S3
  try {
    await s3
      .putObject({
        Bucket: bucketName,
        Key: userCodeKey,
        Body: fs.createReadStream(userCodeFilePath),
      })
      .promise(console.log("Uploaded user code to S3"));

    await s3
      .putObject({
        Bucket: bucketName,
        Key: userInputKey,
        Body: fs.createReadStream(userInputFilePath),
      })
      .promise(console.log("Uploaded user input to S3"));

    await s3
      .putObject({
        Bucket: bucketName,
        Key: outputKey,
        Body: fs.createReadStream(outputFilePath),
      })
      .promise(console.log("Uploaded output to S3"));

    await s3
      .putObject({
        Bucket: bucketName,
        Key: errorKey,
        Body: fs.createReadStream(errorFilePath),
      })
      .promise(console.log("Uploaded error to S3"));
  } catch (err) {
    console.log(err);
  }

  // Delete the user's code and input files after uploading
  try {
    fs.unlinkSync(userCodeFilePath);
    fs.unlinkSync(userInputFilePath);
    fs.unlinkSync(outputFilePath);
    fs.unlinkSync(errorFilePath);
  } catch (err) {
    console.log(err);
  }

  const taskDefinition = "cpp_compiler"; // Make sure this matches your ECS task definition name
  const clusterName = "compiler"; // Ensure this matches your ECS cluster name

  const params = {
    taskDefinition,
    cluster: clusterName,
    launchType: "FARGATE", // or 'EC2'
    overrides: {
      containerOverrides: [
        {
          name: "cpp", // Ensure this matches the container name in your task definition
          command: [
            "./run.sh", // Run the script that fetches, compiles, and executes the C++ code
          ],
        },
      ],
    },
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: ["subnet-0a58051283af4a53e"], // Your subnet ID
        assignPublicIp: "ENABLED", // Enable public IP if needed
      },
    },
    count: 1, // Number of tasks to run
  };

  try {
    // Start the task
    const result = await ecs.runTask(params).promise();

    const taskArn = result.tasks[0].taskArn;

    // Wait for the task to complete
    let taskCompleted = false;
    while (!taskCompleted) {
      // Describe the task to get its status
      const taskStatus = await ecs
        .describeTasks({
          cluster: clusterName,
          tasks: [taskArn],
        })
        .promise();

      const status = taskStatus.tasks[0].lastStatus;
      console.log(`Current task status: ${status}`);

      // Check if the task has completed
      if (status === "STOPPED") {
        taskCompleted = true;
      } else {
        // Wait for a bit before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds
      }
    }

    // Read the output file from S3
    const outputData = await s3
      .getObject({
        Bucket: bucketName,
        Key: outputKey,
      })
      .promise();

    // Convert the output data to a string
    const output = outputData.Body.toString();

    // Read the error file from S3
    const errorData = await s3
      .getObject({
        Bucket: bucketName,
        Key: errorKey,
      })
      .promise();

    // Convert the error data to a string
    const error = errorData.Body.toString();

    if (error) {
      return res.status(400).json({ error: error });
    }

    // Send response to client
    res.json({
      output: output,
    });
  } catch (error) {
    console.error(`Error starting task: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
}

// // Run cpp code locally
// async function runCppCode(req, res) {
//   const { code, input } = req.body; // Get the C++ code from the request
//   console.log(`code: ${code}`);

//   // Save the user's code to a file
//   const userCodeFilePath = path.join(__dirname, "user_code.cpp");
//   fs.writeFileSync(userCodeFilePath, code);

//   // Save the user's input to a file
//   const userInputFilePath = path.join(__dirname, "input.txt");
//   fs.writeFileSync(userInputFilePath, input ?? "");

//   // Resolve the path for Docker volume mount
//   const resolvedPath = path.resolve(__dirname);

//   // Run the Docker container
//   exec(
//     `docker run --rm -v "${resolvedPath}:/usr/src/app" cpp-compiler`,
//     (error, stdout, stderr) => {
//       // Delete the user's code file after execution
//       try {
//         const outputBinaryPath = path.join(__dirname, "output");
//         if (fs.existsSync(outputBinaryPath)) {
//           fs.unlinkSync(outputBinaryPath);
//         }
//         fs.unlinkSync(userInputFilePath);
//         fs.unlinkSync(userCodeFilePath);
//       } catch (unlinkError) {
//         console.error(`Could not delete file: ${unlinkError.message}`);
//       }

//       if (error) {
//         console.error(`Error: ${error.message}`);
//         return res.status(400).json({ error: stderr });
//       }
//       res.json({ output: stdout }); // Send the output back to the user
//     }
//   );
// }

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
