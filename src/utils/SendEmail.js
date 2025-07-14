import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // ✅ Fixed SMTP config directly
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: "cthdotcom@gmail.com",
      pass: "dlvd eyid owya oepc", // ⚠️ make sure this is app password, not real password
    },
  });

  const mailOptions = {
    from: "cthdotcom@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
