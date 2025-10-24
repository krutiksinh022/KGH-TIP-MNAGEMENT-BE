export const createStaffInviteTemplate = (
  firstName,
  lastName,
  email,
  token,
  employementType,
  department
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
      color: #333;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: #28a745;
      color: white;
      text-align: center;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      line-height: 1.6;
    }
    .info-box {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 10px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 10px;
    }
    .btn {
      display: inline-block;
      background: #28a745;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 15px;
      font-weight: bold;
    }
    .btn:hover {
      background: #218838;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">Hotel Staff Invitation</div>
    <div class="content">
      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>
      <p>
        You have been invited to join our hotel team as a 
        <b>${employementType}</b> in the <b>${department}</b> department.
      </p>
      
      <div class="info-box">
        <p><strong>Registered Email:</strong> ${email}</p>
      </div>
      
      <p>
        Please click the button below to verify your invitation and complete your registration:
      </p>

      <!-- Dynamic verification link -->
      <a href="http://localhost:5000/staff/verify-staff?token=${token}" 
         class="btn">Verify & Complete Registration</a>

      <p>We look forward to having you on our team!</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Hotel Management System. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
