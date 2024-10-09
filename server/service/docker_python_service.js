const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const ecs = new AWS.ECS({
  region: "ap-south-1",
});

const s3 = new AWS.S3();

async function runPythonCode(req, res) {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  // Save the user's code to a file
  const userCodeFilePath = path.join(__dirname, "user_code.py");
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
  const userCodeKey = "user/user_code.py";
  const userInputKey = "user/input.txt";
  const outputKey = "user/output.txt";
  const errorKey = "user/error.txt";

  // Upload the user's code and input to S3
  try {
    await s3
      .upload({
        Bucket: bucketName,
        Key: userCodeKey,
        Body: fs.createReadStream(userCodeFilePath),
      })
      .promise();
    await s3
      .upload({
        Bucket: bucketName,
        Key: userInputKey,
        Body: fs.createReadStream(userInputFilePath),
      })
      .promise();
    await s3
      .upload({
        Bucket: bucketName,
        Key: outputKey,
        Body: fs.createReadStream(outputFilePath),
      })
      .promise();
    await s3
      .upload({
        Bucket: bucketName,
        Key: errorKey,
        Body: fs.createReadStream(errorFilePath),
      })
      .promise();
  } catch (error) {
    console.error(error);
  }

  //   Delete the user's code and input files after uploading to S3
  try {
    fs.unlinkSync(userCodeFilePath);
    fs.unlinkSync(userInputFilePath);
    fs.unlinkSync(outputFilePath);
    fs.unlinkSync(errorFilePath);
  } catch (error) {
    console.error(error);
  }

  const taskDefinition = "python_compiler";
  const clusterName = "compiler_python";

  const params = {
    taskDefinition,
    cluster: clusterName,
    launchType: "FARGATE",
    overrides: {
      containerOverrides: [
        {
          name: "python_compiler", // Ensure this matches the container name in your task definition
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
    count: 1,
  };

  try {
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

module.exports = {
  runPythonCode,
};
