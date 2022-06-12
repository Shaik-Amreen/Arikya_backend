const aws = require('aws-sdk');

const ses = new aws.SES({region:"ap-south-1"})

function sendmail(mailDetails, collectmail) {
    // console.log( mailDetails, ".....................")
    sendTestMail(mailDetails).then((err7, data)=> {
        // console.log(err7, data, mailDetails, ".....................")
        if (err7) {
            return true
        }
        else {
            return false
        }
    })
}

function sendTestMail(mailDetails){
    const params = {
        Destination:{
            ToAddresses:[...mailDetails.to]
            // ToAddresses:[mailDetails.to]
        },
        Message : {
            Body:{
                Html : {
                    Data:mailDetails.html
                }
            },
            Subject:{
                Data:mailDetails.subject
            }
        },
        Source:'arikya.hak@gmail.com'
    };
    return ses.sendEmail(params).promise()
}

let mailDetails1 = {
    to: ['karthik.kovi2001@gmail.com','karthikkovik@gmail.com','19691a0559@mits.ac.in'],
    subject: `Karthik Mail Approval`,
    html: `Karthik is here`
  }

  sendmail(mailDetails1);