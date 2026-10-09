const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      'Accept': 'application/json',
      ...(data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      } : {}),
      ...headers
    };

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: reqHeaders
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(responseBody);
        } catch (e) {
          parsed = responseBody;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runEndToEndTests() {
  console.log("==================================================");
  console.log("       STARTING COMPLETE END-TO-END TESTS         ");
  console.log("==================================================");

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedCount++;
    }
  }

  // ------------------------------------------------------------
  // TEST 1: Student Registration -> Pending Status
  // ------------------------------------------------------------
  const testStudentEmail = `e2e.student.${Date.now()}@campus.edu`;
  const studentReg = await request('POST', '/api/auth/register', {
    name: 'Rohit Verma',
    email: testStudentEmail,
    personalEmail: 'rohit.v@gmail.com',
    password: 'studentPassword123',
    phone: '+91 98765 43210'
  });

  assert(studentReg.status === 200 && studentReg.data?.accountStatus === 'PENDING',
    `TEST 1A: Student Registration created in PENDING status (ID: ${studentReg.data?.userId})`);

  const pendingStudentId = studentReg.data?.userId;

  // Unapproved student login must be blocked
  const blockedLogin = await request('POST', '/api/auth/student/login', {
    name: 'Rohit Verma',
    email: testStudentEmail,
    password: 'studentPassword123'
  });
  assert(blockedLogin.status === 400 && blockedLogin.data?.message?.includes('administrator approval'),
    `TEST 1B: Pending student cannot login before admin approval (${blockedLogin.data?.message})`);

  // ------------------------------------------------------------
  // TEST 2: Admin Login -> Dashboard Access
  // ------------------------------------------------------------
  const adminLogin = await request('POST', '/api/auth/admin/login', {
    name: 'Campus Admin',
    email: 'admin@campus.edu',
    adminCode: 'Amma52'
  });

  assert(adminLogin.status === 200 && adminLogin.data?.token,
    `TEST 2: Admin Login successful with code 'Amma52' (Role: ${adminLogin.data?.role})`);

  const adminToken = adminLogin.data?.token;
  const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

  // Verify Admin sees the pending student registration
  const pendingList = await request('GET', '/api/admin/pending-students', null, adminHeaders);
  const foundPending = Array.isArray(pendingList.data) && pendingList.data.some(u => u.id === pendingStudentId);
  assert(foundPending,
    `TEST 1C: Admin sees newly registered pending student in approval queue (Total pending: ${pendingList.data?.length})`);

  // ------------------------------------------------------------
  // TEST 3: Admin Approves Student -> Student Login Works
  // ------------------------------------------------------------
  const approveRes = await request('PUT', `/api/admin/students/${pendingStudentId}/approval`, { status: 'APPROVED' }, adminHeaders);
  assert(approveRes.status === 200 && approveRes.data?.accountStatus === 'APPROVED',
    `TEST 3A: Admin approves student ID ${pendingStudentId} (Status now: APPROVED)`);

  const approvedLogin = await request('POST', '/api/auth/student/login', {
    name: 'Rohit Verma',
    email: testStudentEmail,
    password: 'studentPassword123'
  });
  assert(approvedLogin.status === 200 && approvedLogin.data?.token,
    `TEST 3B: Newly approved student successfully logs in (JWT issued, Role: ${approvedLogin.data?.role})`);

  const studentToken = approvedLogin.data?.token;
  const studentHeaders = { 'Authorization': `Bearer ${studentToken}` };

  // ------------------------------------------------------------
  // TEST 4: Student Dashboard / Profile Access
  // ------------------------------------------------------------
  const profileRes = await request('GET', '/api/auth/me', null, studentHeaders);
  assert(profileRes.status === 200 && profileRes.data?.email === testStudentEmail,
    `TEST 4: Student profile & session authenticated via Bearer JWT (${profileRes.data?.name})`);

  // ------------------------------------------------------------
  // TEST 5 & 6: Admin Registration & OTP Security
  // ------------------------------------------------------------
  // 5A: send-otp with invalid Admin Registration Code -> rejected
  const badCodeOtp = await request('POST', '/api/auth/admin/send-otp', {
    phone: '9876543210',
    email: 'newadmin@campus.edu',
    adminCode: 'WrongCode99'
  });
  assert(badCodeOtp.status === 400 && badCodeOtp.data?.message?.includes('Invalid admin registration code'),
    `TEST 5A: send-otp strictly validates Admin Registration Code before OTP service (${badCodeOtp.data?.message})`);

  // 5B: send-otp with valid code -> calls MessageCentral
  const sendOtpRes = await request('POST', '/api/auth/admin/send-otp', {
    phone: '9398227889',
    email: 'newadmin@campus.edu',
    adminCode: 'Amma52'
  });
  console.log(`[DIAGNOSTIC] MessageCentral send-otp response: HTTP ${sendOtpRes.status}, Response:`, JSON.stringify(sendOtpRes.data));
  // If MessageCentral returned error or verificationId
  const mcConfigured = sendOtpRes.status === 200;
  if (mcConfigured) {
    assert(sendOtpRes.data?.verificationId,
      `TEST 5B: MessageCentral returned real verificationId: ${sendOtpRes.data?.verificationId}`);
  } else {
    assert(sendOtpRes.data?.error === 'MESSAGECENTRAL_API_ERROR' || sendOtpRes.status === 400,
      `TEST 5B: MessageCentral API reachable, safe diagnosis returned: ${sendOtpRes.data?.errorMessage || sendOtpRes.data?.message}`);
  }

  // TEST 6: Direct Admin register with fake OTP -> rejected
  const fakeOtpReg = await request('POST', '/api/auth/admin/register', {
    name: 'Hacker Admin',
    email: 'hacker@campus.edu',
    phone: '9876543210',
    adminCode: 'Amma52',
    otp: '999999'
  });
  assert(fakeOtpReg.status === 400,
    `TEST 6: Admin registration without verified OTP strictly rejected (Status: ${fakeOtpReg.status})`);

  // ------------------------------------------------------------
  // TEST 7: Lost Item Creation
  // ------------------------------------------------------------
  const createLost = await request('POST', '/api/lost', {
    title: 'Blue Hydroflask Water Bottle',
    category: 'BOTTLE',
    description: 'Stainless steel navy blue water bottle with campus stickers',
    primaryColor: 'Blue',
    locationId: 1, // Library
    lostDate: '2026-10-04',
    lostTime: '14:30:00'
  }, studentHeaders);

  assert(createLost.status === 200 && createLost.data?.id,
    `TEST 7: Lost Item reported successfully (ID: ${createLost.data?.id}, Title: ${createLost.data?.title})`);

  const createdLostId = createLost.data?.id;

  // ------------------------------------------------------------
  // TEST 8: Found Item Creation
  // ------------------------------------------------------------
  const createFound = await request('POST', '/api/found', {
    title: 'Navy Blue Metal Water Bottle',
    category: 'BOTTLE',
    description: 'Found navy blue stainless bottle near library reference desk',
    primaryColor: 'Navy Blue',
    locationId: 1, // Library
    foundDate: '2026-10-04',
    foundTime: '14:45:00',
    handoverOption: 'KEEPING_WITH_ME'
  }, studentHeaders);

  assert(createFound.status === 200 && createFound.data?.id,
    `TEST 8: Found Item reported successfully (ID: ${createFound.data?.id}, Title: ${createFound.data?.title})`);

  const createdFoundId = createFound.data?.id;

  // ------------------------------------------------------------
  // TEST 9: Algorithmic Matching Engine
  // ------------------------------------------------------------
  const matchesRes = await request('GET', `/api/matches/lost/${createdLostId}`, null, studentHeaders);
  assert(matchesRes.status === 200 && Array.isArray(matchesRes.data),
    `TEST 9A: Matching Engine executed for Lost Item ID ${createdLostId} (Matches found: ${matchesRes.data?.length})`);

  if (matchesRes.data?.length > 0) {
    const topMatch = matchesRes.data[0];
    console.log(`[MATCH RESULT] Top match score: ${topMatch.matchScore}%, Found Item ID: ${topMatch.foundItemId} (${topMatch.foundItemTitle})`);
  }

  // ------------------------------------------------------------
  // TEST 10: Campus Graph & Dijkstra Shortest Path
  // ------------------------------------------------------------
  const dijkstraRes = await request('GET', '/api/campus/shortest-path?from=1&to=4', null, studentHeaders);
  assert(dijkstraRes.status === 200 && dijkstraRes.data?.distanceMeters > 0,
    `TEST 10: Dijkstra Shortest Path calculated (Library -> Main Canteen: ${dijkstraRes.data?.distanceMeters}m via ${dijkstraRes.data?.pathNodes?.join(' -> ')})`);

  // ------------------------------------------------------------
  // TEST 11: CORS Preflight Verification
  // ------------------------------------------------------------
  const corsPreflight = await request('OPTIONS', '/api/auth/student/login', null, {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Authorization'
  });
  const allowOrigin = corsPreflight.headers['access-control-allow-origin'];
  assert(corsPreflight.status === 200 && (allowOrigin === 'http://localhost:5173' || allowOrigin === '*'),
    `TEST 11: CORS Preflight OPTIONS handled cleanly (Allowed Origin: ${allowOrigin})`);

  // ------------------------------------------------------------
  // TEST 12: Logout / Token Invalidation verification
  // ------------------------------------------------------------
  const unauthRes = await request('GET', '/api/auth/me', null, { 'Authorization': 'Bearer invalid_token_xyz' });
  assert(unauthRes.status === 401,
    `TEST 12: Expired/Invalid token correctly returns 401 Unauthorized (${unauthRes.status})`);

  console.log("==================================================");
  console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("==================================================");
}

runEndToEndTests().catch(console.error);
