//Twój kod
// Twój kod

const fs = require('fs');
const express = require('express');


const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static('./public/zadanieDnia/'));


app.post('/add', (req, res) => {
    const { newTask } = req.body;
    console.log(newTask);
    addRecord('./public/zadanieDnia/db.json', newTask);
    res.json({
        newTask, //Pamiętasz ten skrótowy zapis (reversed : reversed)?
    });
});

app.post('/all', (req, res) => {
    console.log(req.body);
    const task = req.body;
    updateRecord('./public/zadanieDnia/db.json', req.body);
    res.end();
});

app.post('/destroy', (req, res) => {
    console.log("removing");
    removeRecord('./public/zadanieDnia/db.json', req.body);
    res.end();
});

app.post('/clear', (req, res) => {
    console.log(req.body);
    const task = req.body;
    task.done = 0;
    updateRecord('./public/zadanieDnia/db.json', task)

    res.end();
});


app.post('/toggleall', (req, res) => {

    const task = req.body;
    task.done = 1;
    updateRecord('./public/zadanieDnia/db.json', task)

    res.end();
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});


function addRecord(database, record) {
    fs.readFile(database, (err, data) => {
        if (!err) {
            
            const recordsTab = JSON.parse(data);
           
            recordsTab.push({ task:record, done:0 });

            const recordsString = JSON.stringify(recordsTab);

            fs.writeFile(database, recordsString, (err, data) => {
                if (!err) {
                    console.log("File saved")
                }
                else {
                    console.log("Cannot savae file");
                }
            });
        }
        else {
            console.log("Cannot read file");
        }
    });
}

function updateRecord(database, record) {
    fs.readFile(database, (err, data) => {
        if (!err) {

            const recordsTab = JSON.parse(data);

            recordsTab.forEach((storedRecord, index) => {
                if (storedRecord.task === record.task) {
                    recordsTab[index] = { task: record.task, done: parseInt(record.done) };
                }
            })

            const recordsString = JSON.stringify(recordsTab);

            fs.writeFile(database, recordsString, (err, data) => {
                if (!err) {
                    console.log("File saved")
                }
                else {
                    console.log("Cannot save file");
                }
            });
        }
        else {
            console.log("Cannot read file");
        }
    });
}


function removeRecord(database, record) {
    fs.readFile(database, (err, data) => {
        if (!err) {
            const recordsTab = JSON.parse(data);
            
            recordsTab.forEach((storedRecord, index) => {
               
                if (storedRecord.task === record.task) {
                    recordsTab.splice(index, 1);
                }
            })

            const recordsString = JSON.stringify(recordsTab);

            fs.writeFile(database, recordsString, (err, data) => {
                if (!err) {
                    console.log("File saved")
                }
                else {
                    console.log("Cannot savae file");
                }
            });
        }
        else {
            console.log("Cannot read file");
        }
    });
}


function readAllRecords(database) {
    fs.readFile(database, (err, data) => {
        if (!err) {
            const recordsTab = JSON.parse(data);
            return recordsString = JSON.stringify(recordsTab);
        }
        else {
            console.log("Cannot read file");
        }
    });
}


