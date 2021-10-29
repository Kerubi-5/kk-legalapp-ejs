const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

module.exports = function sendMail(email, link, user_fname) {
    const options = {
        from: process.env.EMAIL,
        to: email,
        subject: "Registration confirmation with 3JBG Legal Web Application!",
        html: `<h1>Hello ${user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=` + link + ">Click here to verify</a>"
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
