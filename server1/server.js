const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Enable CORS for cross-origin requests

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Middleware to handle large JSON payloads
app.use(bodyParser.json({ limit: "10mb" }));

// Function to sanitize filenames
const sanitizeFilename = (filename) =>
  filename.replace(/[^a-zA-Z0-9_-]/g, "_");

// Function to format the current date and time
const getReadableTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

// Endpoint to handle image uploads
app.post("/upload", async (req, res) => {
  const { url, timeStart } = req.body;

  if (!url) {
    return res.status(400).send("Missing URL data.");
  }

  const startProcessing = new Date(); // Start time for processing
  const sanitizedUrl = sanitizeFilename(url);
  const timestamp = getReadableTimestamp();
  const fileName = `${sanitizedUrl}_${timestamp}.png`;
  const screenshotsDir = path.join(__dirname, "screenshots");
  const filePath = path.join(screenshotsDir, fileName);

  // Ensure the screenshots directory exists
  fs.mkdirSync(screenshotsDir, { recursive: true });

  try {
    // Launch Puppeteer to capture screenshot
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.screenshot({ path: filePath, fullPage: true });
    await browser.close();

    console.log(`Screenshot saved as ${fileName}`);
    console.log("Request received at:", new Date(timeStart));
    console.log("Time taken to process request:", new Date() - new Date(timeStart), "ms");

    res.status(200).send(`Screenshot saved as ${fileName}`);
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    res.status(500).send("Failed to capture screenshot.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
