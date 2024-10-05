const http = require("http");
const express = require("express");
const cors = require("cors");
const runCodeRoute = require("./routes/run_code_route");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());
app.use("/run-code", runCodeRoute);

// Set up a simple route
app.get("/", (req, res) => {
  res.send("This is working");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
