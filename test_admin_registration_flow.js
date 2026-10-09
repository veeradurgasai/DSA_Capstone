const http = require('http');

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(resBody);
        } catch {
          parsed = resBody;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('==================================================');
  console.log('   TESTING ADMIN REGISTRATION FLOW & FIXES       ');
  console.log('==================================================');

  // STEP 1: Test with a NEW email that does NOT exist in database
  const newEmail = `new.admin.${Date.now()}@campus.edu`;
  console.log(`Testing with new email: ${newEmail}`);

  const sendOtpNewEmail = await request('POST', '/api/auth/admin/send-otp', {
    name: 'New Administrator',
    email: newEmail,
    phone: '9876543210',
    adminCode: 'Amma52'
  });

  console.log('Send OTP status:', sendOtpNewEmail.status);
  console.log('Send OTP response:', JSON.stringify(sendOtpNewEmail.data));

  const responseText = JSON.stringify(sendOtpNewEmail.data).toLowerCase();
  if (responseText.includes('email is not found in database')) {
    console.error('FAIL: Still returning "email is not found in database"!');
    process.exit(1);
  } else {
    console.log('[PASS] Confirm NEW email does NOT return "Email is not found in database"');
  }

  // STEP 2: Test with an EXISTING email (duplicate email prevention)
  const existingEmail = 'admin@campus.edu';
  console.log(`\nTesting duplicate email check with existing: ${existingEmail}`);

  const sendOtpExistingEmail = await request('POST', '/api/auth/admin/send-otp', {
    name: 'Duplicate Admin',
    email: existingEmail,
    phone: '9876543210',
    adminCode: 'Amma52'
  });

  console.log('Send OTP existing email status:', sendOtpExistingEmail.status);
  console.log('Send OTP existing email response:', JSON.stringify(sendOtpExistingEmail.data));

  if (sendOtpExistingEmail.status === 400 && 
      (sendOtpExistingEmail.data.message || '').includes('already registered')) {
    console.log('[PASS] Duplicate email registration correctly rejected: ' + sendOtpExistingEmail.data.message);
  } else {
    console.error('FAIL: Existing email was not rejected as already registered!');
    process.exit(1);
  }

  // STEP 3: Test direct Admin Registration with existing email
  const registerExistingEmail = await request('POST', '/api/auth/admin/register', {
    name: 'Campus Admin',
    email: existingEmail,
    phone: '9876543210',
    adminCode: 'Amma52',
    otp: '123456'
  });

  if (registerExistingEmail.status === 400 && 
      (registerExistingEmail.data.message || '').includes('already registered')) {
    console.log('[PASS] Direct Admin Registration with existing email correctly rejected: ' + registerExistingEmail.data.message);
  } else {
    console.error('FAIL: Direct registration with existing email was not rejected!');
    process.exit(1);
  }

  // STEP 4: Test unverified Admin Registration with a new email (no valid OTP session)
  const registerNewUnverified = await request('POST', '/api/auth/admin/register', {
    name: 'Unverified Admin',
    email: newEmail,
    phone: '9876543210',
    adminCode: 'Amma52',
    otp: '999999'
  });

  if (registerNewUnverified.status === 400) {
    console.log('[PASS] Admin registration without valid OTP session strictly rejected (Status: ' + registerNewUnverified.status + ', Message: ' + (registerNewUnverified.data.message || '') + ')');
  } else {
    console.error('FAIL: Admin registration without valid OTP was not rejected!');
    process.exit(1);
  }

  // STEP 5: Test Admin Login with existing admin
  const adminLogin = await request('POST', '/api/auth/admin/login', {
    name: 'Campus Administrator',
    email: 'admin@campus.edu',
    adminCode: 'Amma52'
  });

  if (adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.role === 'ROLE_ADMIN') {
    console.log('[PASS] Admin Login works for authorized admin: ' + adminLogin.data.name + ' (' + adminLogin.data.role + ')');
  } else {
    console.error('FAIL: Admin Login failed!');
    process.exit(1);
  }

  // STEP 6: Test Student Registration & Login flow integrity
  const studentEmail = `student.${Date.now()}@campus.edu`;
  const studentReg = await request('POST', '/api/auth/register', {
    name: 'Kavita Joshi',
    email: studentEmail,
    password: 'password123',
    phone: '9876543211',
    personalEmail: `kavita.${Date.now()}@gmail.com`
  });

  if (studentReg.status === 200 && (studentReg.data.accountStatus === 'PENDING' || studentReg.data.status === 'PENDING')) {
    console.log('[PASS] Student Registration flow intact: PENDING status assigned (ID: ' + studentReg.data.userId + ')');
  } else {
    console.error('FAIL: Student Registration flow failed! Response:', JSON.stringify(studentReg.data));
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('       ALL ADMIN REGISTRATION TESTS PASSED!       ');
  console.log('==================================================');
}

run().catch(err => {
  console.error('Unexpected error during test execution:', err);
  process.exit(1);
});
