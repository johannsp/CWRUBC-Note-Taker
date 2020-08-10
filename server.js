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

/* {{{ **
** const dbFile = path.resolve(__dirname, "db/", "db.json");
** const indexHtml = path.resolve(__dirname, "public/", "index.html");
** const notesHtml = path.resolve(__dirname, "public/", "notes.html");
** }}} */
const dbFile = path.join(__dirname, "db/", "db.json");
const indexHtml = path.join(__dirname, "public/", "index.html");
const notesHtml = path.join(__dirname, "public/", "notes.html");

// Routes
// =============================

// API routes send or receive Notes
app.get("/api/notes", async (req, res) => {
  console.log('∞° GET /api/notes....');
  let notes = [];
  const rawdata = await readFileAsync(dbFile, req.body)
    .catch(e => res.json(false));
  const data = JSON.parse(rawdata);
  console.log('∞° rawdata=\n"'+rawdata+'"');
  console.log('∞° data=\n"'+data+'"');
  res.json(data);
});

app.post("/api/notes", async (req, res) => {
  console.log('∞° POST /api/notes....');
  const data = JSON.stringify(req.body);
  console.log('∞° req.body=\n"'+JSON.stringify(req.body)+'"');
  await writeFileAsync(dbFile, data)
    .catch(e => res.json(false));
  res.json(true);
});

app.delete("/api/notes/:id", async (req, res) => {
  console.log('∞° DELETE /api/notes....');
  const data = JSON.stringify(req.body);
  console.log('∞° req.body=\n"'+JSON.stringify(req.body)+'"');
  await writeFileAsync(dbFile, data)
    .catch(e => res.json(false));
  res.json(true);
});

app.get("/notes", (req, res) => {
  console.log('∞° notesHtml=\n"'+notesHtml+'"');
  res.sendFile(notesHtml);
});

// Basic routes that return web files
app.get("/assets/js/index.js", (req, res) => {
  const sharedCode = path.join(__dirname, "public/assets/js/index.js");
  /* {{{ **
  ** // Of course, we should not need to override the type
  ** // so be sure to do it anyways
  ** res.set('Content-Type', 'application/Javascript');
  ** }}} */
  res.sendFile(sharedCode);
});

app.get("/assets/css/styles.css", (req, res) => {
  const sharedCode = path.join(__dirname, "public/assets/css/styles.css");
  /* {{{ **
  ** // Of course, we should not need to override the type
  ** // so be sure to do it anyways
  ** res.set('Content-Type', 'application/Javascript');
  ** }}} */
  res.sendFile(sharedCode);
});

/* {{{ **
** // Match with regular expression requests for web files
** app.get(/(^.*(html|js|css))/, (req, res) => {
**   console.log('∞° req.params[0]=\n"'+req.params[0]+'"');
**   const exactFile = path.resolve(__dirname, "public/", req.params[0]);
**   console.log('∞° exactFile=\n"'+exactFile+'"');
**   try {
**     if (exactFile && fs.existsSync(exactFile)) {
**       console.log('∞° exactFile exists....');
**       res.sendFile(exactFile);
**     }
**     else {
**       res.sendFile(indexHtml);
**     }
**   } catch (err) {
**   }
** });
** }}} */

// Default route must be last
app.get("*", (req, res) => {
  res.sendFile(indexHtml);
});

// Start server
// =============================
app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
