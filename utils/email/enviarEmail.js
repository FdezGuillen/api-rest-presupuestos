const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const dotenv = require('dotenv');
const enviarEmail = async (email, subject, payload, template) => {
  try {
    dotenv.config();
    // Configuramos transport
    //IMPORTANTE: Para que funcione, es necesario un fichero .env con el correo y la contraseña desde el que se enviará el email
    // Además, en google hay que activar el uso de aplicaciones no seguras: https://www.google.com/settings/security/lesssecureapps
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      secure: false,
      auth: {
        user: process.env.FROM_EMAIL, 
        pass: process.env.FROM_PASSWORD, 
      },
    });

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      };
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        return error;
      }
      console.log("Email enviado");
      return res.status(200).json({
        success: true,
      });
    });
  } catch (error) {
    return error;
  }
};

/*
Example:
sendEmail(
  "youremail@gmail.com,
  "Email subject",
  { name: "Eze" },
  "./templates/layouts/main.handlebars"
);
*/

module.exports = enviarEmail;