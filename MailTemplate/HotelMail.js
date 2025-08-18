export const createHotelTemplate = (adminEmail, generatedPassword) => `
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
      background: #007bff;
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
    .credentials {
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
      background: #007bff;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 15px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">Hotel Admin Account Created</div>
    <div class="content">
      <p>Hello,</p>
      <p>Your hotel admin account has been successfully created. Please use the following credentials to log in:</p>
      
      <div class="credentials">
        <p><strong>Email:</strong> ${adminEmail}</p>
        <p><strong>Password:</strong> ${generatedPassword}</p>
      </div>
      
      <p>Please log in and change your password immediately after your first login for security purposes.</p>
      <a href="https://yourhotelportal.com/login" class="btn">Login Now</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Hotel Management System. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
