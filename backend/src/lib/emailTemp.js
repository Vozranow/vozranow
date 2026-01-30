export const verifyEmailHtml = (validationCode) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify your email</title>
  </head>
  <body style="
    background-color: #ffffff;
    font-family: Helvetica, Arial, sans-serif;
    padding: 20px;
    margin: 0;
  ">
    <div style="
      max-width: 360px;
      margin: 0 auto;
      padding: 40px 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      background-color: #ffffff;
    ">

      <p style="
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #2563eb;
        letter-spacing: 1px;
        margin: 8px 8px;
      ">
        VERIFY YOUR EMAIL
      </p>

      <h2 style="
        text-align: center;
        font-size: 20px;
        font-weight: 500;
        margin: 0 0 24px;
        color: #000000;
      ">
        Enter the following code to verify your email.
      </h2>

      <div style="
        background-color: #f1f5f9;
        border-radius: 6px;
        padding: 12px;
        margin: 0 auto 20px;
        width: 280px;
        text-align: center;
      ">
        <span style="
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 6px;
          margin: 0;
          color: #000000;
        ">
          ${validationCode}
        </span>
      </div>

      <p style="
        text-align: center;
        font-size: 15px;
        line-height: 23px;
        color: #444444;
        margin: 6px 0;
      ">
        Not expecting this email?
      </p>

      <p style="
        text-align: center;
        font-size: 15px;
        line-height: 23px;
        color: #444444;
        margin: 6px 0;
      ">
        Contact
        <a
          href="mailto:support@solance.app"
          style="
            color: #444444;
            text-decoration: underline;
          "
        >
          support@solance.app
        </a>
        if you did not request this code.
      </p>
    </div>

    <p style="
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      margin-top: 20px;
      text-transform: uppercase;
      color: #000000;
    ">
      Securely powered by Solance
    </p>
  </body>
</html>
`;


export const forgotPasswordEmailHtml = (resetLink) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset your password</title>
  </head>
  <body style="
    background-color: #ffffff;
    font-family: Helvetica, Arial, sans-serif;
    padding: 20px;
    margin: 0;
  ">

    <div style="
      max-width: 360px;
      margin: 0 auto;
      padding: 40px 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      background-color: #ffffff;
    ">

      <p style="
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #2563eb;
        letter-spacing: 1px;
        margin: 8px 8px;
      ">
        RESET PASSWORD
      </p>

      <h2 style="
        text-align: center;
        font-size: 20px;
        font-weight: 500;
        margin: 0 0 16px;
        color: #000000;
      ">
        Create a new password
      </h2>

      <p style="
        text-align: center;
        font-size: 15px;
        line-height: 23px;
        color: #444444;
        margin: 0 0 24px;
      ">
        We received a request to reset your password.
        Click the button below to set a new one.
      </p>

      <div style="text-align: center; margin-bottom: 24px;">
        <a
          href="${resetLink}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="
        text-align: center;
        font-size: 14px;
        line-height: 22px;
        color: #444444;
        margin: 6px 0;
      ">
        This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="
        text-align: center;
        font-size: 14px;
        line-height: 22px;
        color: #444444;
        margin: 12px 0 0;
      ">
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <p style="
        text-align: center;
        font-size: 14px;
        line-height: 22px;
        color: #444444;
        margin: 16px 0 0;
      ">
        Need help?
        <a
          href="mailto:support@solance.app"
          style="
            color: #444444;
            text-decoration: underline;
          "
        >
          Contact support
        </a>
      </p>

    </div>

    <p style="
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      margin-top: 20px;
      text-transform: uppercase;
      color: #000000;
    ">
      Securely powered by Solance
    </p>

  </body>
</html>
`;
