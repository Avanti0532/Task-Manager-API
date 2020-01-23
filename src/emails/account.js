const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name)=>{

    sgMail.send({
        to: email,
        from: 'avanti.deshmukh532@gmail.com',
        subject: 'Welcome to the app',
        text: `Hi ${name}, Thank you for joining us.`
    })

}

const cancelEmail = (email, name)=>{

    sgMail.send({
        to: email,
        from: 'avanti.deshmukh532@gmail.com',
        subject: 'GoodBye!',
        text: `Hi ${name}, 
        Please let us know the reason of cancellation. Hope to see you soon.`
    })

}

module.exports = {
    sendWelcomeEmail,
    cancelEmail
}



