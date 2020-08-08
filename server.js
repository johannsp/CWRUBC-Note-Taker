// Dependencies
// =============================
const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");

// Setup code
// =============================
const app = express();
const PORT = process.env.PORT || 3000;

// Handle data parsing
// =============================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const appendFileAsync = util.promisify(fs.appendFile);

const dbFile = path.resolve(__dirname, "db/", "db.json");
const indexHtml = path.resolve(__dirname, "public/", "index.html");
const notesHtml = path.resolve(__dirname, "public/", "notes.html");

// Routes
// =============================

// API routes send or receive Notes
app.get("/api/notes", async (req, res) => {
  console.log('∞° GET /api/notes....');
  /* {{{ **
  ** const data = await readFileAsync(dbFile, req.body)
  **   .catch(e => res.json(false));
  ** res.json(data);
  ** }}} */
});

app.post("/api/notes", async (req, res) => {
  console.log('∞° POST /api/notes....');
  /* {{{ **
  ** const data = req.body;
  ** await writeFileAsync(dbFile, data)
  **   .catch(e => res.json(false));
  ** res.json(true);
  ** }}} */
});

// Basic routes that return HTML files
app.get("/notes", (req, res) => {
  console.log('∞° notesHtml=\n"'+notesHtml+'"');
  res.sendFile(notesHtml);
});

app.get("*", (req, res) => {
  console.log('∞° indexHtml=\n"'+indexHtml+'"');
  res.sendFile(indexHtml);
});

// Start server
// =============================
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
