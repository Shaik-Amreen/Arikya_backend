const nodemailer = require("nodemailer")
const mailcollection = require('../models/mail');

let mailTransporter = nodemailer.createTransport({
    service: "gmail.com",
    auth: {
        user: "arikya.hak@gmail.com",
        pass: "msatbnhnozoxvksu",
    },
    secureConnection: true,
    tls: {
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_method",
    },
})

function sendmail(mailDetails, collectmail) {
    // console.log( mailDetails, ".....................")
    mailTransporter.sendMail(mailDetails, function (err7, data) {
        // console.log(err7, data, mailDetails, ".....................")
        if (err7) {
            return true
        }
        else {
            // mailDetails.to.forEach(m => {
            //     collectmail.to = [mailDetails.to]
            //     mailcollection.create(collectmail, (er, d) => {
            //         er ? console.log(er) : console.log('mail stored:', d)
            //     })
            // })
            return false
        }
    })
}

// function deletecodefiloes() {
//     const fs = require('fs');
//     const path = require('path');
//     const directory = './controllers/codes';
//     fs.readdir(directory, (err, files) => {
//         if (err) throw err;
//         for (const file of files) {
//             fs.unlink(path.join(directory, file), err => {
//                 if (err) throw err;
//             });
//         }
//     });
// }

// deletecodefiloes()





// function trailmail(mailDetails) {
//     mailTransporter.sendMail(mailDetails, function (err7, data) {
//         console.log(err7, data)
//         if (err7) {
//             console.log("fail")
//             return true
//         }
//         else {
//             console.log("succes")
//             return false
//         }
//     })
// }

// let mailDetails = {
//     from: "placementscycle@gmail.com",
//     to: "amreenshaik40@gmail.com",
//     subject: `Arikya going to be launch `,
//     html: `Arikya to the corparate world`,
//   }

// trailmail(mailDetails);



module.exports = sendmail

