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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Solance password</title>
  </head>
  <body style="
    background-color: #F3F4F6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 40px 20px;
    margin: 0;
    -webkit-font-smoothing: antialiased;
  ">

    <div style="
      max-width: 480px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    ">
      
      <div style="background-color: #4F46E5; height: 6px; width: 100%;"></div>
      
      <div style="padding: 40px 32px;">
        
        <h1 style="
          text-align: center;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px;
          color: #111827;
          letter-spacing: -0.5px;
        ">
          Solance
        </h1>
        
        <p style="
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: #4F46E5;
          letter-spacing: 1.5px;
          margin: 0 0 32px;
          text-transform: uppercase;
        ">
          Account Security
        </p>

        <h2 style="
          text-align: left;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px;
          color: #1F2937;
        ">
          Create a new password
        </h2>

        <p style="
          text-align: left;
          font-size: 15px;
          line-height: 24px;
          color: #4B5563;
          margin: 0 0 32px;
        ">
          We received a request to reset your Solance password. You can set up a new one by clicking the button below. If you didn't make this request, your account is perfectly safe and you can ignore this email.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a
            href="${resetLink}"
            style="
              display: inline-block;
              padding: 14px 28px;
              background-color: #4F46E5;
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
            "
          >
            Reset Password
          </a>
        </div>

        <div style="
          background-color: #EEF2FF;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        ">
          <p style="
            text-align: center;
            font-size: 14px;
            line-height: 20px;
            color: #4338CA;
            margin: 0;
          ">
            ⏱️ For security reasons, this link will expire in <strong>15 minutes</strong>.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />

        <p style="
          text-align: center;
          font-size: 14px;
          line-height: 22px;
          color: #6B7280;
          margin: 0;
        ">
          Need help? <a href="mailto:support@mail.soumyodeep.online" style="color: #4F46E5; text-decoration: none; font-weight: 500;">Contact our support team</a>
        </p>

      </div>
    </div>

    <p style="
      text-align: center;
      font-size: 13px;
      font-weight: 500;
      margin-top: 24px;
      color: #9CA3AF;
    ">
      Securely powered by <span style="font-weight: 600; color: #6B7280;">Solance</span>
    </p>

  </body>
</html>
`;

// Add to emailTemp.js

export const sessionAssignedUserHtml = (username, speakerName, startTime) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #F3F4F6; font-family: sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #4F46E5; height: 6px; width: 100%;"></div>
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 800; margin: 0 0 4px; color: #111827;">Solance</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #4F46E5; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Session Confirmed</p>
        
        <h2 style="font-size: 18px; color: #1F2937; margin: 0 0 16px;">Hello ${username},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #4B5563; margin: 0 0 24px;">Your session has been successfully assigned! Here are your details:</p>
        
        <div style="background-color: #EEF2FF; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
          <p style="margin: 0 0 10px; color: #4338CA; font-size: 14px;"><strong>Speaker:</strong> ${speakerName}</p>
          <p style="margin: 0; color: #4338CA; font-size: 14px;"><strong>Time:</strong> ${startTime}</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #6B7280; margin: 0;">Please log in 5 minutes before your session begins.</p>
      </div>
    </div>
  </body>
</html>
`;

export const sessionAssignedSpeakerHtml = (speakerName, startTime, duration) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #F3F4F6; font-family: sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #10B981; height: 6px; width: 100%;"></div> <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 800; margin: 0 0 4px; color: #111827;">Solance</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #10B981; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">New Assignment</p>
        
        <h2 style="font-size: 18px; color: #1F2937; margin: 0 0 16px;">Hello ${speakerName},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #4B5563; margin: 0 0 24px;">An admin has assigned a new session to you.</p>
        
        <div style="background-color: #ECFDF5; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
          <p style="margin: 0 0 10px; color: #047857; font-size: 14px;"><strong>Time:</strong> ${startTime}</p>
          <p style="margin: 0; color: #047857; font-size: 14px;"><strong>Duration:</strong> ${duration} minutes</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

export const managerEscalationHtml = (sessionId, userEmail, scheduledTime) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #F3F4F6; font-family: sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #EF4444; height: 6px; width: 100%;"></div> <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 800; margin: 0 0 4px; color: #111827;">URGENT ALERT</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #EF4444; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Session Escalation</p>
        
        <h2 style="font-size: 18px; color: #1F2937; margin: 0 0 16px;">Hello Manager,</h2>
        <p style="font-size: 15px; line-height: 24px; color: #4B5563; margin: 0 0 24px;">A session is approaching the 2-hour Danger Zone and still has <strong>no listener assigned</strong>.</p>
        
        <div style="background-color: #FEF2F2; border-radius: 8px; padding: 20px; margin-bottom: 32px; border: 1px solid #FECACA;">
          <p style="margin: 0 0 10px; color: #B91C1C; font-size: 14px;"><strong>Client Email:</strong> ${userEmail}</p>
          <p style="margin: 0 0 10px; color: #B91C1C; font-size: 14px;"><strong>Requested Time:</strong> ${scheduledTime}</p>
          <p style="margin: 0; color: #B91C1C; font-size: 14px;"><strong>Session ID:</strong> ${sessionId}</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #6B7280; margin: 0;">Please log into the Manager Dashboard immediately to force-assign a Listener.</p>
      </div>
    </div>
  </body>
</html>
`;