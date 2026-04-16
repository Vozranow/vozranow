// --- BASE STYLES USED ACROSS TEMPLATES ---
// Background: #FDFCF8 (Cream)
// Card Bg: #FFFFFF
// Primary Green: #173F3A
// Soft Green: #E8F4F1
// Text Dark: #2D2A26
// Text Muted: #5C5954
// Borders: #E8E6E1

export const verifyEmailHtml = (validationCode) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your email</title>
  </head>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 400px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(23, 63, 58, 0.04);">
      
      <div style="background-color: #173F3A; height: 6px; width: 100%;"></div>
      
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #2D2A26; letter-spacing: -0.5px;">
          Vozranow
        </h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #8C877D; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">
          Verify Your Email
        </p>

        <h2 style="text-align: center; font-size: 16px; font-weight: 500; margin: 0 0 24px; color: #5C5954; line-height: 24px;">
          Enter the following secure code to verify your account registration.
        </h2>

        <div style="background-color: #E8F4F1; border: 1px solid #BFD4D1; border-radius: 12px; padding: 16px; margin: 0 auto 24px; text-align: center;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0; color: #173F3A;">
            ${validationCode}
          </span>
        </div>

        <p style="text-align: center; font-size: 14px; line-height: 22px; color: #8C877D; margin: 0;">
          Didn't request this code? You can safely ignore this email or contact <a href="mailto:support@vozranow.app" style="color: #173F3A; text-decoration: underline; font-weight: 500;">support@vozranow.app</a>.
        </p>
      </div>
    </div>
    <p style="text-align: center; font-size: 12px; font-weight: 500; margin-top: 24px; color: #8C877D;">
      Securely powered by <span style="font-weight: 700; color: #5C5954;">Vozranow</span>
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
    <title>Reset your Vozranow password</title>
  </head>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(23, 63, 58, 0.04);">
      
      <div style="background-color: #173F3A; height: 6px; width: 100%;"></div>
      
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #2D2A26; letter-spacing: -0.5px;">
          Vozranow
        </h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #8C877D; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">
          Account Security
        </p>

        <h2 style="text-align: left; font-size: 18px; font-weight: 600; margin: 0 0 12px; color: #2D2A26;">
          Create a new password
        </h2>

        <p style="text-align: left; font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 32px;">
          We received a request to reset your Vozranow password. You can securely set up a new one by clicking the button below.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background-color: #173F3A; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px;">
            Reset Password
          </a>
        </div>

        <div style="background-color: #FDFDF9; border: 1px solid #E8E6E1; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <p style="text-align: center; font-size: 13px; line-height: 20px; color: #5C5954; margin: 0;">
            For your security, this link will expire in <strong>15 minutes</strong>. If you did not request this, your account is safe and you can ignore this email.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #E8E6E1; margin: 32px 0;" />

        <p style="text-align: center; font-size: 13px; color: #8C877D; margin: 0;">
          Need help? <a href="mailto:support@vozranow.app" style="color: #173F3A; text-decoration: none; font-weight: 600;">Contact our support team</a>
        </p>
      </div>
    </div>
    <p style="text-align: center; font-size: 12px; font-weight: 500; margin-top: 24px; color: #8C877D;">
      Securely powered by <span style="font-weight: 700; color: #5C5954;">Vozranow</span>
    </p>
  </body>
</html>
`;

export const sessionAssignedUserHtml = (username, speakerName, startTime) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(23, 63, 58, 0.04);">
      <div style="background-color: #173F3A; height: 6px; width: 100%;"></div>
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #2D2A26;">Vozranow</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #3A6B65; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Session Confirmed</p>
        
        <h2 style="font-size: 18px; color: #2D2A26; margin: 0 0 12px;">Hello ${username},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 24px;">Your session request has been successfully assigned. A listener is ready to connect with you.</p>
        
        <div style="background-color: #E8F4F1; border: 1px solid #BFD4D1; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
          <p style="margin: 0 0 12px; color: #173F3A; font-size: 14px;"><strong>Listener:</strong> ${speakerName}</p>
          <p style="margin: 0; color: #173F3A; font-size: 14px;"><strong>Scheduled Time:</strong> ${startTime}</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #8C877D; margin: 0;">Please log into your dashboard 5 minutes prior to your session start time.</p>
      </div>
    </div>
  </body>
</html>
`;

export const sessionAssignedSpeakerHtml = (speakerName, startTime, duration) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(23, 63, 58, 0.04);">
      <div style="background-color: #173F3A; height: 6px; width: 100%;"></div>
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 24px; font-weight: 700; margin: 0 0 4px; color: #2D2A26;">Vozranow</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #3A6B65; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">New Assignment</p>
        
        <h2 style="font-size: 18px; color: #2D2A26; margin: 0 0 12px;">Hello ${speakerName},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 24px;">A system admin has matched you with a new client session.</p>
        
        <div style="background-color: #E8F4F1; border: 1px solid #BFD4D1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 12px; color: #173F3A; font-size: 14px;"><strong>Start Time:</strong> ${startTime}</p>
          <p style="margin: 0; color: #173F3A; font-size: 14px;"><strong>Duration:</strong> ${duration} minutes</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #8C877D; margin: 0;">You can view full details in your Listener Dashboard.</p>
      </div>
    </div>
  </body>
</html>
`;

export const managerEscalationHtml = (sessionId, userEmail, scheduledTime) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(155, 44, 44, 0.05);">
      <div style="background-color: #9B2C2C; height: 6px; width: 100%;"></div>
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #2D2A26;">System Alert</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #9B2C2C; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Session Escalation</p>
        
        <h2 style="font-size: 18px; color: #2D2A26; margin: 0 0 12px;">Manager Required,</h2>
        <p style="font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 24px;">A session is approaching the 2-hour Danger Zone and currently has <strong>no listener assigned</strong>.</p>
        
        <div style="background-color: #FDF2F2; border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid #FCA5A5;">
          <p style="margin: 0 0 12px; color: #9B2C2C; font-size: 14px;"><strong>Client Email:</strong> ${userEmail}</p>
          <p style="margin: 0 0 12px; color: #9B2C2C; font-size: 14px;"><strong>Requested Time:</strong> ${scheduledTime}</p>
          <p style="margin: 0; color: #9B2C2C; font-size: 14px; font-family: monospace;"><strong>Session ID:</strong> ${sessionId}</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #8C877D; margin: 0;">Please log into the Command Center immediately to force-assign a Listener.</p>
      </div>
    </div>
  </body>
</html>
`;

export const listenerCancellationHtml = (speakerName, scheduledTime) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(217, 119, 87, 0.05);">
      <div style="background-color: #D97757; height: 6px; width: 100%;"></div> 
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #2D2A26;">Schedule Update</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #D97757; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Session Cancelled</p>
        
        <h2 style="font-size: 18px; color: #2D2A26; margin: 0 0 12px;">Hello ${speakerName},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 24px;">The client has cancelled their upcoming session. Your schedule has been automatically updated in the system.</p>
        
        <div style="background-color: #FDF8F5; border-radius: 12px; padding: 20px; margin-bottom: 32px; border: 1px solid #FDBA74;">
          <p style="margin: 0; color: #9A3412; font-size: 14px;"><strong>Freed Time Slot:</strong> ${scheduledTime}</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #8C877D; margin: 0;">No further action is required. You are now available to be matched with new clients during this time.</p>
      </div>
    </div>
  </body>
</html>
`;

export const disputeRejectedUserHtml = (username, managerNote) => `
<!DOCTYPE html>
<html>
  <body style="background-color: #FDFCF8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E8E6E1; box-shadow: 0 4px 12px rgba(45, 42, 38, 0.04);">
      <div style="background-color: #2D2A26; height: 6px; width: 100%;"></div>
      <div style="padding: 40px 32px;">
        <h1 style="text-align: center; font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #2D2A26;">Dispute Resolution</h1>
        <p style="text-align: center; font-size: 11px; font-weight: 700; color: #5C5954; letter-spacing: 1.5px; margin: 0 0 32px; text-transform: uppercase;">Claim Reviewed</p>
        
        <h2 style="font-size: 18px; color: #2D2A26; margin: 0 0 12px;">Hello ${username},</h2>
        <p style="font-size: 15px; line-height: 24px; color: #5C5954; margin: 0 0 24px;">Our management team has completed the review of your recent session dispute. Based on the audit of the session logs and platform policies, we are unable to approve a refund for this claim.</p>
        
        <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #E8E6E1;">
          <p style="margin: 0 0 8px; color: #8C877D; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Manager's Note</p>
          <p style="margin: 0; color: #2D2A26; font-size: 14px; line-height: 22px; font-style: italic;">"${managerNote}"</p>
        </div>
        
        <p style="text-align: center; font-size: 14px; color: #8C877D; margin: 0;">We understand this may not be the outcome you hoped for. If you have further questions, you can reply directly to this email to reach our support team.</p>
      </div>
    </div>
    <p style="text-align: center; font-size: 12px; font-weight: 500; margin-top: 24px; color: #8C877D;">
      Securely powered by <span style="font-weight: 700; color: #5C5954;">Vozranow</span>
    </p>
  </body>
</html>
`;