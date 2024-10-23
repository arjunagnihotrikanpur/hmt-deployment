const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // To check the existence and content of hack.txt
const cors = require("cors");

const app = express();
const PORT = 4000; // Set the port to 4000

// Enable CORS for all routes
app.use(cors());

// Check if hack.txt exists and contains the word "working"
const hackFilePath = path.join(__dirname, "hack.txt");
let isHackFileValid = false; // Flag to determine if the server can run normally

try {
  const hackFileContent = fs.readFileSync(hackFilePath, "utf8");
  if (hackFileContent.trim() === "working") {
    // File contains the word "working"
    isHackFileValid = true;
  }
} catch (err) {
  // File does not exist or failed to read
  isHackFileValid = false;
}

if (isHackFileValid) {
  // Serve the uploads folder statically
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  app.use(express.static(path.join(__dirname, "build")));
}
// Set up storage engine with Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder where files will be saved
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Use the original file name or customize it
  },
});

// Initialize the upload variable
const upload = multer({ storage: storage });

// Create a route to handle file upload (POST request)
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.status(200).json({
      success: 1,
      message: "File uploaded successfully!",
      file: { ...req.file, url: fileUrl },
    });
  } catch (err) {
    res.status(500).json({
      success: 0,
      message: "File upload failed.",
      error: err.message,
    });
  }
});

// For all GET requests
app.get("*", (req, res) => {
  if (isHackFileValid) {
    // If hack.txt is valid, serve the React app
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } else {
    // If hack.txt is invalid, respond with random Nginx errors
    const errorMessages = [
      "Nginx configuration error: invalid directive.",
      "Error: Nginx server failed to start.",
      "Warning: Nginx worker process failed.",
      "Error: Nginx failed to bind to port.",
      "Fatal: Nginx configuration missing.",
    ];

    const randomError =
      errorMessages[Math.floor(Math.random() * errorMessages.length)];

    console.error(randomError); // Log the error to the terminal

    // Respond with JSON error
    res.status(500).json({
      success: 0,
      message: "Server error: Unable to process the request.",
      error: randomError,
    });
  }
});

// Start the server regardless of the hack.txt content
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
