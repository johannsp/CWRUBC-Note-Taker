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

// DB file operations
// =============================
//
const readFromDB = async () => {
  console.log('∞° readFromDB....');
  //return [{title: "Test Title1", text: "Test Text1", id: 0}];
  // DB file may not exit at beginning so if there is a
  // read error return an empty array.
  try {
    if (fs.existsSync(dbFile)) {
      const rawdata = await readFileAsync(dbFile)
      const data = JSON.parse(rawdata);
      console.log('∞° rawdata=\n"'+rawdata+'"');
      console.log('∞° data=\n"'+data+'"');
      // Use .map method to add a unstored id field
      const notes = data.map((note, index) => {
        note.id = index;
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
  console.log('∞° writeToDB....');
  let ok = true;
  // Use map to remove the id from the raw data that is
  // about to be stored
  console.log('∞° notes=\n"'+notes+'"');
  const rawdata = notes.map((note) => { note.title, note.text });
  console.log('∞° rawdata=\n"'+rawdata+'"');
  const data = JSON.stringify(rawdata);
  console.log('∞° data=\n"'+data+'"');
  await writeFileAsync(dbFile, data)
    .catch(e => ok = false);
  return ok;
}

// Routes
// =============================

// API routes send or receive Notes
app.get("/api/notes", async (req, res) => {
  console.log('∞° GET /api/notes....');
  const data = await readFromDB();
  console.log('∞° data=\n"'+data+'"');
  console.log('∞° data=\n"'+JSON.stringify(data)+'"');
  res.json(data);
});

app.post("/api/notes", async (req, res) => {
  console.log('∞° POST /api/notes....');
  let current = await readFromDB();
  console.log('∞° current=\n"'+current+'"');
  console.log('∞° current=\n"'+JSON.stringify(current)+'"');
  let note = {};
  note.title = req.body.title;
  note.text = req.body.text;
  note.id = current.length;
  console.log('∞° note=\n"'+note+'"');
  console.log('∞° note=\n"'+JSON.stringify(note)+'"');
  current.push(note);
  console.log('∞° current=\n"'+current+'"');
  console.log('∞° current=\n"'+JSON.stringify(current)+'"');
  if (await writeToDB(current)) {
    res.json(current);
  } else {
    res.json(false);
  }
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
