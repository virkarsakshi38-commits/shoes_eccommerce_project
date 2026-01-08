const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,        // true for 465, false for other ports
  auth: {
    user: "virkarsakshi38@gmail.com",
    pass: " xnor zkny waja nhzz",
  },

});

async function sendMail(to_mail,subject,message)
{
    const info = await transporter.sendMail({
    from: '"Sakshi Virkar" <virkarsakshi38@gmail.com>',
    to: to_mail,
    subject: subject,
    text: message, 
  });
  console.log("Message sent:", info.messageId);

}

module.exports = sendMail;