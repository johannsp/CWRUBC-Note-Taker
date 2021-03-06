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

// Enable DEBUG to log status information on server side
const DEBUG = true;

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

// DB file operations
// =============================
//
const readFromDB = async () => {
  if (DEBUG) { // {{{ Debugging output
    console.log('readFromDB....');
  } //DEBUG       }}} End debugging
  /* {{{ **
  ** // Simulate data for testing
  ** return [{title: "Test Title1", text: "Test Text1", id: 0}];
  ** }}} */
  // DB file may not exit at beginning so if there is a
  // read error return an empty array.
  try {
    if (fs.existsSync(dbFile)) {
      const rawdata = await readFileAsync(dbFile)
      const data = JSON.parse(rawdata);
      if (DEBUG) { // {{{ Debugging output
        console.log('rawdata=\n"'+rawdata+'"');
        console.log('data=\n"'+data+'"');
      } //DEBUG       }}} End debugging
      // Use .map method to add a unstored id field
      // Nb. number from 1 not 1 so id can be used as boolean
      const notes = data.map((note, index) => {
        note.id = index + 1;
        return note;
      });
      return notes;
    }
    else return [];
  } catch(e) {
    console.log('In readFromDB e.message=\n"'+e.message+'"');
    return [];
  }
}

const writeToDB = async (notes) => {
  if (DEBUG) { // {{{ Debugging output
    console.log('writeToDB....');
  } //DEBUG       }}} End debugging
  let ok = true;
  // Use map to remove the id from the raw data that is
  // about to be stored
  if (DEBUG) { // {{{ Debugging output
    console.log('notes=\n"'+notes+'"');
    console.log('notes=\n"'+JSON.stringify(notes)+'"');
  } //DEBUG       }}} End debugging
  const rawdata = notes.map((note) => {
    let copy = {};
    copy.title = note.title;
    copy.text = note.text;
    return copy
  });
  if (DEBUG) { // {{{ Debugging output
    console.log('rawdata=\n"'+rawdata+'"');
  } //DEBUG       }}} End debugging
  // Write the updated current list to the DB file
  const data = JSON.stringify(rawdata);
  if (DEBUG) { // {{{ Debugging output
    console.log('data=\n"'+data+'"');
  } //DEBUG       }}} End debugging
  await writeFileAsync(dbFile, data)
    .catch(e => ok = false);
  return ok;
}

// Routes
// =============================

// API routes send or receive Notes
app.get("/api/notes", async (req, res) => {
  if (DEBUG) { // {{{ Debugging output
    console.log('GET /api/notes....');
  } //DEBUG       }}} End debugging
  // Read the current notes list
  const current = await readFromDB();
  if (DEBUG) { // {{{ Debugging output
    console.log('current=\n"'+current+'"');
    console.log('current=\n"'+JSON.stringify(current)+'"');
  } //DEBUG       }}} End debugging
  // Return current notes list with sequentially numbered from 1 ids
  res.json(current);
});

app.post("/api/notes", async (req, res) => {
  if (DEBUG) { // {{{ Debugging output
    console.log('POST /api/notes....');
  } //DEBUG       }}} End debugging
  // Read the current notes list
  let current = await readFromDB();
  if (DEBUG) { // {{{ Debugging output
    console.log('current=\n"'+current+'"');
    console.log('current=\n"'+JSON.stringify(current)+'"');
  } //DEBUG       }}} End debugging
  // Create and push an object for the new note
  let note = {};
  note.title = req.body.title;
  note.text = req.body.text;
  note.id = current.length;
  if (DEBUG) { // {{{ Debugging output
    console.log('note=\n"'+note+'"');
    console.log('note=\n"'+JSON.stringify(note)+'"');
  } //DEBUG       }}} End debugging
  current.push(note);
  if (DEBUG) { // {{{ Debugging output
    console.log('current=\n"'+current+'"');
    console.log('current=\n"'+JSON.stringify(current)+'"');
  } //DEBUG       }}} End debugging
  // Write the updated current notes list to the DB file
  if (await writeToDB(current)) {
    // Return current notes list with sequentially numbered from 1 ids
    res.json(current);
  } else {
    res.json(false);
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  if (DEBUG) { // {{{ Debugging output
    console.log('DELETE /api/notes....');
  } //DEBUG       }}} End debugging
  // Extract the id number
  const id = parseInt(req.params.id, 10);
  // Read the current notes list
  const current = await readFromDB();
  if (DEBUG) { // {{{ Debugging output
    console.log('current=\n"'+current+'"');
    console.log('current=\n"'+JSON.stringify(current)+'"');
  } //DEBUG       }}} End debugging
  // Use filter to remove the note matching the id
  const updated = current.filter((note) => (note.id != id));
  if (DEBUG) { // {{{ Debugging output
    console.log('updated=\n"'+updated+'"');
  } //DEBUG       }}} End debugging
  // Write the updated notes list to the DB file
  if (await writeToDB(updated)) {
    // Return current notes list with sequentially numbered from 1 ids
    res.json(updated);
  } else {
    res.json(false);
  }
});

app.get("/notes", (req, res) => {
  if (DEBUG) { // {{{ Debugging output
    console.log('/notes....');
    console.log('notesHtml=\n"'+notesHtml+'"');
  } //DEBUG       }}} End debugging
  res.sendFile(notesHtml);
});

// Basic routes that return web files
app.get("/assets/js/index.js", (req, res) => {
  const sharedCode = path.join(__dirname, "public/assets/js/index.js");
  /* {{{ **
  ** // If necessary override the content type
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
