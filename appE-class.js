const express = require("express")
const app = express();
const basicAuth = require("./basicAuth")
const fs = require("fs");
const path = require("path")
const bodyParser = require('body-parser');
const settings = require("./settingsE")


let acceptedStudents = {}
let tries;

//const names = require("./questions")
//const names = require("./names")
const names = require("./namesE")
const database = settings.database;
console.log("DATABASE", database)
fs.readFile(`./${database}`, (err, data) => {
  ({ ids: acceptedStudents, tries } = JSON.parse(data));
  //Initialize "database" with students from the original list
  //Should only happen ONCE
  if (Object.keys(acceptedStudents).length != names.length) {
    console.log("Initializing")
    names.forEach(name => {
      if (!acceptedStudents[name.id]) {
        acceptedStudents[name.id] = 0
      }
    })
    const data = { ids: acceptedStudents, tries }
    fs.writeFile(`./${database}`, JSON.stringify(data), (err, res) => {
      if (err) throw err
    })
  }
})

const saveStatus = (status) => {
  new Promise((resolve, reject) => {
    fs.writeFile(`./${database}`, JSON.stringify(status), (err, res) => {
      if (err) {
        reject(err)
      }
      resolve();
    })
  })
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(basicAuth);
app.use('/', express.static(path.join(__dirname, './public')));


app.get('/', (req, res) => res.end("<h2>Demo</h2>"));

app.get('/api/settings', (req, res) => res.json(settings));

app.get("/api/next-student", async (req, res) => {
  let name;
  //Check if any student have not yeat made a minimum of tries presentations
  let stillMissing = false;
  for (const s in acceptedStudents) {
    if (acceptedStudents[s] < tries) {
      stillMissing = true;
    }
  }
  if (!stillMissing) {
    tries = tries + 1;
    await saveStatus({ ids: acceptedStudents, tries })
  }

  let foundStudent = false;
  while (!foundStudent) {
    const index = Math.floor(Math.random() * names.length);
    name = names[index];
    if (acceptedStudents[name.id] < tries) {
      foundStudent = true;
    }
  }
  res.json(name)
})



app.get("/api/presentation-status", (req, res) => {
  const status = names.map(name => {
    const student = { id: name.id, name: name.name, presentations: 0 }
    if (acceptedStudents[name.id]) {
      student.presentations = acceptedStudents[name.id];
    }
    return student;
  })
  const result = { tries, status }
  return res.json(result);
})

app.post("/api/student-accepted", async (req, res) => {
  const acceptedStudent = req.body;
  const id = acceptedStudent.id;
  acceptedStudents[id] = acceptedStudents[id] + 1
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ status: "OK" })
})

app.post("/api/increment-presentations", async (req, res) => {
  const body = req.body;
  const id = body.id;
  const inc = body.inc;
  acceptedStudents[id] = acceptedStudents[id] + inc
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ status: "OK" })
})

app.post("/api/clear-all-presentations", async (req, res) => {
  for (const s in acceptedStudents) {
    acceptedStudents[s] = 0;
  }
  tries = settings.defaultValueForAllowed || 1;
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ status: "All-Cleared" })
})

app.post("/api/increase-allowed-presentations", async (req, res) => {
  tries = tries + 1;
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ tries })
})
app.post("/api/decrement-allowed-presentations", async (req, res) => {
  if (tries > 1) {
    tries = tries - 1;
  }
  const data = { ids: acceptedStudents, tries }
  await saveStatus(data);
  res.json({ tries })
})

app.listen(settings.port, () => console.log(`Server started, listening on port ${settings.port}`))