const nodemailer = require("nodemailer");
require("dotenv").config();

const SendEmail = async (email, type, userName, details) => {
  let subject = "";
  let htmlContent = "";

  switch (type) {
    case "OTP":
      subject = "Your One-Time Password (OTP)";
      htmlContent = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Your OTP</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    background-color: #ffffff;
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                    text-align: center;
                }
                .otp {
                    font-size: 32px;
                    font-weight: bold;
                    color: #0077B6;
                    text-align: center;
                    margin: 20px 0;
                }
                p {
                    color: #444;
                    text-align: center;
                    margin: 10px 0;
                }
                .cta-button {
                    background-color: #0077B6;
                    border: none;
                    color: #ffffff;
                    padding: 12px 24px;
                    text-align: center;
                    text-decoration: none;
                    display: inline-block;
                    font-size: 16px;
                    margin: 20px auto;
                    border-radius: 5px;
                    cursor: pointer;
                    display: block;
                    width: 50%;
                    margin: 20px auto;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Your One-Time Password (OTP)</h1>
                <p>Your OTP for the requested action is:</p>
                <div class="otp">${details.otp}</div>
                <p>Please use this OTP to complete your transaction.</p>
                <p>Note: This OTP is valid for a limited time.</p>
                <p>Thank you for using our service!</p>
            </div>
        </body>
        </html>`;
      break;

    case "FundAdded":
      subject = "Fund Added Successfully";
      htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Fund Added</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .cta-button {
              background-color: #28a745;
              color: white;
              font-size: 16px;
              padding: 12px 25px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Fund Added Successfully</h1>
            </div>
            <p>Hello ${userName},</p>
            <p>Your account has been successfully credited with <strong>$${details.amountAdded}</strong>.</p>
            <p>Thank you for using our service!</p>
            <a href="https://yourwebsite.com/dashboard" class="cta-button">View Your Balance</a>
            <div class="footer">
              <p>If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact us</a>.</p>
            </div>
          </div>
        </body>
        </html>`;
      break;

    case "ReferralApproved":
      subject = "Referral Approved";
      htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Referral Approved</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .cta-button {
              background-color: #28a745;
              color: white;
              font-size: 16px;
              padding: 12px 25px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Referral Approved</h1>
            </div>
            <p>Hello ${userName},</p>
            <p>Great news! Your referral has been successfully approved, and you have earned a reward of <strong>$${details.reward}</strong>.</p>
            <p>Thank you for referring a friend to our platform!</p>
            <a href="https://yourwebsite.com/referrals" class="cta-button">View Your Referrals</a>
            <div class="footer">
              <p>If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact us</a>.</p>
            </div>
          </div>
        </body>
        </html>`;
      break;

    case "WelcomeUser":
      subject = "Welcome to Our Platform";
      htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .cta-button {
              background-color: #007bff;
              color: white;
              font-size: 16px;
              padding: 12px 25px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Platform</h1>
            </div>
            <p>Hello ${userName},</p>
            <p>We are excited to welcome you to our platform! You’re all set to start exploring our services.</p>
            <p>We’re here to support you. If you have any questions, feel free to reach out to our support team.</p>
            
            <div class="footer">
              <p>If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact us</a>.</p>
            </div>
          </div>
        </body>
        </html>`;
      break;

    case "ReferralPersonJoined":
      subject = "Referral Person Joined";
      htmlContent = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Referral Joined</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
            }
            .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .cta-button {
              background-color: #007bff;
              color: white;
              font-size: 16px;
              padding: 12px 25px;
              border-radius: 5px;
              text-decoration: none;
              display: inline-block;
              text-align: center;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #777;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Referral Joined</h1>
            </div>
            <p>Hello ${userName},</p>
            <p>Great news! Your referral, ${details.referralName}, has successfully joined our platform.</p>
            <p>Keep referring and earning rewards!</p>
            <a href="https://yourwebsite.com/referrals" class="cta-button">View Your Referrals</a>
            <div class="footer">
              <p>If you have any questions, feel free to <a href="mailto:support@yourcompany.com">contact us</a>.</p>
            </div>
          </div>
        </body>
        </html>`;
      break;

    default:
      return;
  }

  const mailOptions = {
    from: process.env.Email,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.Email,
        pass: process.env.PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
};

module.exports = SendEmail;
