// package, loads sensitive env vars from .env file into process.env object
require("dotenv").config();

let express = require("express");
const mongoose = require("mongoose");

// Get the MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT;

// Check if the URI is defined
if (!mongoURI) {
  console.error("Error: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

// Check if the port is defined
if (!port) {
  console.error("Error: PORT is not defined in environment variables.");
  process.exit(1);
}

// provides routes for materials
const materialRoutes = require("./routes/materials");
const userRoutes = require("./routes/user");
mongoose.set("strictQuery", true);

// express app
let app = express();
// TODO discover why setting is ignored. Cached?
app.disable("x-powered-by");

// middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/materials", materialRoutes);
app.use("/api/user", userRoutes);

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB!");
    // listen to port
    app.listen(port, () => {
      console.log("listening for requests on port", port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  });