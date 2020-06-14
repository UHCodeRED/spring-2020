const express = require('express');
const bodyParser = require('body-parser');
const {google} = require('googleapis');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

console.log(process.env)
const app = express();
const PORT = process.env.PORT

app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static(__dirname + '/dist'))
app.use(fileUpload());

const client = new google.auth.JWT(
    process.env.CLIENT_EMAIL, null, process.env.API_KEY, [
     'https://www.googleapis.com/auth/spreadsheets',
     'https://www.googleapis.com/auth/drive.file'
    ]
);

client.authorize(function(err, tokens) {
    if(err) {
        console.log(err);
        return
    } else {
        console.log('connected');
    }
});

app.post('/' , (req, res) => {
    let userData = req.body; // returns a jS object
    console.log(userData)
    //process gender
    let gender = ""
    if(userData.gender[0] == 'on') {
        gender = userData.gender[1]
    }
    else { gender = userData.gender[0] }

    //process interests checkboxes
    let interestOptions = ['mobile', 'desktop', 'frontend', 'backend', 'hardware', 'gameDev', 'cyber', 'undecidded']
    let codingInterest = ""
    interestOptions.forEach(interest => {
        if(interest in userData) {
            codingInterest = codingInterest + interest + ", "
        }
    })
    codingInterest = codingInterest.slice(0, -2)

    //process dropdown selects
    let raceEthnicity = "";
    if('raceEthnicity' in userData) {
        raceEthnicity = userData.raceEthnicity
    }

    let educationLevel = "";
    if('educationLevel' in userData) {
        educationLevel = userData.educationLevel
    }

    let gradeLevel = "";
    if('gradeLevel' in userData) {
        gradeLevel = userData.gradeLevel
    }


    let codingLevel = "";
    if('codingLevel' in userData) {
        codingLevel = userData.codingLevel
    }

    //process resume upload - file is stored into temp folder. 
    let resume = req.files
    let resumeValid = false;
    if(req.files != null) {
        resume = req.files.resume
        resumeValid = true;
        resume.mv('./temp/'+resume.name, function(err) {
            if(err) {
                console.log(err);
            }
        });
    }
    
    //DO NOT change this order!
    let dataTosend = [
        [userData.name],
        [userData.school],
        [userData.email],
        [userData.phoneNumber],
        [userData.addressLine1],
        [userData.addressLine2],
        [userData.age],
        [gender],
        [raceEthnicity],
        [educationLevel],
        [gradeLevel],
        [codingLevel],
        [codingInterest],
        [userData.twitter],
        [userData.github],
        [resumeValid]
    ]
    //data is appended to google sheets
    async function appendData(client) {
        const gsapi = google.sheets({version : "v4", auth : client});
        const options = {
            spreadsheetId: '1AuJhgKKzvaTJVJ6layJOJXeeZcUmtN9m42HCkku2GtU',
            range: 'A:P',
            valueInputOption: 'USER_ENTERED',
            resource: {majorDimension: 'COLUMNS', values: dataTosend}
        };
        await gsapi.spreadsheets.values.append(options);
    }
    //file is uploaded to drive, file name is same as user name. 
    async function uploadFile(client) {
        const drive = google.drive({version : "v3", auth : client});
        const folderId = '1WtyciCupeNj8OAUJQZtCAakvSoOGYx3O';
        let fileMetadata = {
            name: userData.name,
            parents: [folderId]
          };
          let media = {
            mimeType: resume.mimetype,
            body: fs.createReadStream('./temp/' + resume.name)
          };
          drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
          }, function (err, file) {
            if (err) {
              // Handle error
              console.error(err);
            }
          });
    }
    appendData(client); 

    //file is deleted from temp folder after upload to google drive. 
    if(resume != null) { 
        uploadFile(client);
        path = './temp/' + resume.name;
        fs.unlink(path, (err) => {
            if(err) {
                console.log(err)
            }
        })
    }
    res.sendFile('index.html' , { root: __dirname + '/dist' });
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));

