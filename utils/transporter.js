const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

module.exports = function sendMail(email, title, msg) {
    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: title,
        html: msg
    }

    transporter.sendMail(options, (err, data) => {
        try {
            if (err) throw Error(err)
            else console.log("Email sent")
        } catch (err) {
            console.log(err)
        }
    })
}
