const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors"); // Import cors middleware

const app = express();
const PORT = 4000; // Set the port to 4000

// Enable CORS for all routes
app.use(cors());

// Serve the uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "build")));

// Set up storage engine with Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder where files will be saved
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Use the original file name or customize it
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Initialize the upload variable
const upload = multer({ storage: storage });

// Create a route to handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    // Construct the URL to access the uploaded file
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.status(200).json({
      success: 1, // Change success to 1 for true
      message: "File uploaded successfully!",
      file: { ...req.file, url: fileUrl },
    });
  } catch (err) {
    res.status(500).json({
      success: 0, // Change success to 0 for false
      message: "File upload failed.",
      error: err.message,
    });
  }
});

// Fallback: Send index.html for any other requests (for React client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
