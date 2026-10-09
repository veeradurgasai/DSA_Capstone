const http = require('http');

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const r = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(b); } catch { parsed = b; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

let passed = 0;
let failed = 0;

function check(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passed++;
  } else {
    console.error(`[FAIL] ${desc}`);
    failed++;
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('       STARTING COMPLETE SYSTEM AUDIT & VERIFICATION            ');
  console.log('================================================================');

  const timestamp = Date.now();

  // 1. ADMIN 1 LOGIN
  const admin1Login = await req('POST', '/api/auth/admin/login', {
    name: 'Campus Administrator',
    email: 'admin@campus.edu',
    adminCode: 'Amma52'
  });
  check('Admin 1 Login succeeds with credentials & code Amma52', admin1Login.status === 200 && admin1Login.body.token);
  const admin1Token = admin1Login.body.token;

  // 2. ADMIN 2 LOGIN (Multi-Admin test)
  const admin2Login = await req('POST', '/api/auth/admin/login', {
    name: 'Assistant Admin',
    email: 'admin2@campus.edu',
    adminCode: 'Amma52'
  });
  check('Admin 2 Login succeeds with credentials & code Amma52', admin2Login.status === 200 && admin2Login.body.token);
  const admin2Token = admin2Login.body.token;

  // 3. STUDENT REGISTRATION (Student X)
  const studentXEmail = `audit.student.x.${timestamp}@campus.edu`;
  const studentXReg = await req('POST', '/api/auth/register', {
    name: 'Harish Chandra',
    email: studentXEmail,
    personalEmail: `harish.${timestamp}@gmail.com`,
    phone: '9876543201',
    password: 'password123'
  });
  check('Student X Registration creates account with PENDING status', 
    studentXReg.status === 200 && (studentXReg.body.accountStatus === 'PENDING' || studentXReg.body.status === 'PENDING'));
  const studentXId = studentXReg.body.userId;

  // 4. MULTI-ADMIN VISIBILITY: Check Admin 1 Dashboard
  const admin1Pending = await req('GET', '/api/admin/pending-students', null, { 'Authorization': 'Bearer ' + admin1Token });
  const admin1FoundX = Array.isArray(admin1Pending.body) && admin1Pending.body.some(s => s.id === studentXId);
  check('Student X registration is visible to Admin 1', admin1FoundX);

  // 5. MULTI-ADMIN VISIBILITY: Check Admin 2 Dashboard
  const admin2Pending = await req('GET', '/api/admin/pending-students', null, { 'Authorization': 'Bearer ' + admin2Token });
  const admin2FoundX = Array.isArray(admin2Pending.body) && admin2Pending.body.some(s => s.id === studentXId);
  check('Student X registration is visible to Admin 2', admin2FoundX);

  // 6. PENDING STUDENT CANNOT LOGIN
  const pendingLogin = await req('POST', '/api/auth/student/login', {
    name: 'Harish Chandra',
    email: studentXEmail,
    password: 'password123'
  });
  check('Pending student login is strictly blocked before approval', pendingLogin.status === 400 && (pendingLogin.body.message || '').includes('waiting for administrator approval'));

  // 7. ADMIN 1 APPROVES STUDENT X
  const approveRes = await req('PUT', `/api/admin/students/${studentXId}/approval`, { status: 'APPROVED' }, { 'Authorization': 'Bearer ' + admin1Token });
  check('Admin 1 approves Student X successfully', approveRes.status === 200 && approveRes.body.accountStatus === 'APPROVED');

  // 8. ADMIN 2 SEES UPDATED STATUS (Multi-Admin sync)
  const admin2PendingAfter = await req('GET', '/api/admin/pending-students', null, { 'Authorization': 'Bearer ' + admin2Token });
  const admin2PendingHasX = Array.isArray(admin2PendingAfter.body) && admin2PendingAfter.body.some(s => s.id === studentXId);
  check('Admin 2 sees Student X removed from pending list after Admin 1 approval', !admin2PendingHasX);

  const admin2AllStudents = await req('GET', '/api/admin/students', null, { 'Authorization': 'Bearer ' + admin2Token });
  const admin2ApprovedX = Array.isArray(admin2AllStudents.body) && admin2AllStudents.body.some(s => s.id === studentXId && s.accountStatus === 'APPROVED');
  check('Admin 2 sees Student X as APPROVED in the student directory', admin2ApprovedX);

  // 9. APPROVED STUDENT X CAN NOW LOGIN
  const studentXLogin = await req('POST', '/api/auth/student/login', {
    name: 'Harish Chandra',
    email: studentXEmail,
    password: 'password123'
  });
  check('Approved student X can log in and receives JWT', studentXLogin.status === 200 && studentXLogin.body.token);
  const studentXToken = studentXLogin.body.token;

  // 10. REJECTION WORKFLOW TEST (Student Y)
  const studentYEmail = `audit.student.y.${timestamp}@campus.edu`;
  const studentYReg = await req('POST', '/api/auth/register', {
    name: 'Sneha Reddy',
    email: studentYEmail,
    personalEmail: `sneha.${timestamp}@gmail.com`,
    phone: '9876543202',
    password: 'password123'
  });
  const studentYId = studentYReg.body.userId;
  check('Student Y Registration created in PENDING status', studentYReg.status === 200);

  const rejectRes = await req('PUT', `/api/admin/students/${studentYId}/approval`, { status: 'REJECTED' }, { 'Authorization': 'Bearer ' + admin2Token });
  check('Admin 2 rejects Student Y successfully', rejectRes.status === 200 && rejectRes.body.accountStatus === 'REJECTED');

  const rejectedLogin = await req('POST', '/api/auth/student/login', {
    name: 'Sneha Reddy',
    email: studentYEmail,
    password: 'password123'
  });
  check('Rejected student login is strictly blocked', rejectedLogin.status === 400 && (rejectedLogin.body.message || '').includes('was not approved'));

  // 11. LOST REQUEST CREATION & PERSISTENCE
  const studentXHeaders = { 'Authorization': 'Bearer ' + studentXToken };
  const lostCreate = await req('POST', '/api/lost', {
    title: 'Silver Apple MacBook Air',
    category: 'Electronics',
    brand: 'Apple',
    color: 'Silver',
    description: 'Left M2 MacBook Air with sticker on top inside Library 2nd floor reading hall',
    locationId: 1, // Library
    lostDate: '2026-10-04',
    lostTime: '11:00:00',
    keywords: ['macbook', 'apple', 'laptop', 'silver']
  }, studentXHeaders);
  check('Student creates Lost Request without needing admin approval', lostCreate.status === 200 && lostCreate.body.id);
  const lostId = lostCreate.body.id;

  // Verify persistence in student's own requests
  const myLost = await req('GET', '/api/lost/my', null, studentXHeaders);
  const myLostFound = Array.isArray(myLost.body) && myLost.body.some(i => i.id === lostId);
  check('Lost Request persists in Student own requests list', myLostFound);

  // 12. FOUND REQUEST CREATION & HANDOVER OPTIONS
  const foundCreate = await req('POST', '/api/found', {
    title: 'Silver Apple Laptop',
    category: 'Electronics',
    brand: 'Apple',
    color: 'Silver',
    description: 'Found Apple MacBook Air on 2nd floor library desk near windows',
    locationId: 1, // Library
    foundDate: '2026-10-04',
    foundTime: '11:30:00',
    handoverOption: 'KEEPING_WITH_ME',
    keywords: ['apple', 'macbook', 'laptop']
  }, studentXHeaders);
  check('Student creates Found Request with handoverOption KEEPING_WITH_ME', foundCreate.status === 200 && foundCreate.body.id);
  const foundId = foundCreate.body.id;

  // 13. FOUND ITEM STATUS FLOW VALIDATION
  // Valid transition: KEEPING_WITH_ME -> HANDED_TO_OSW
  const updateStatus1 = await req('PUT', `/api/found/${foundId}/progress`, {
    status: 'HANDED_TO_OSW',
    handoverOption: 'HANDED_TO_OSW'
  }, studentXHeaders);
  check('Valid status update (KEEPING_WITH_ME -> HANDED_TO_OSW) succeeds', updateStatus1.status === 200 && updateStatus1.body.status === 'HANDED_TO_OSW');

  // Valid transition: HANDED_TO_OSW -> HANDED_TO_LOST_PERSON
  const updateStatus2 = await req('PUT', `/api/found/${foundId}/progress`, {
    status: 'HANDED_TO_LOST_PERSON'
  }, studentXHeaders);
  check('Valid status update (HANDED_TO_OSW -> HANDED_TO_LOST_PERSON) succeeds', updateStatus2.status === 200 && updateStatus2.body.status === 'HANDED_TO_LOST_PERSON');

  // Valid transition: HANDED_TO_LOST_PERSON -> RESOLVED
  const updateStatus3 = await req('PUT', `/api/found/${foundId}/resolve`, null, studentXHeaders);
  check('Resolution of found item succeeds (Status: RESOLVED)', updateStatus3.status === 200 && updateStatus3.body.status === 'RESOLVED');

  // Invalid transition: Attempting to modify terminal state RESOLVED back to FOUND
  const invalidStatus = await req('PUT', `/api/found/${foundId}/progress`, {
    status: 'FOUND'
  }, studentXHeaders);
  check('Invalid status transition from terminal RESOLVED state is rejected by backend', invalidStatus.status === 400);

  // 14. MATCHING ENGINE & PERCENTAGE CALCULATION
  const matchesRes = await req('GET', `/api/matches/lost/${lostId}`, null, studentXHeaders);
  const hasMatches = Array.isArray(matchesRes.body) && matchesRes.body.length > 0;
  check('DSA Matching engine computes matches for Lost item', hasMatches);
  if (hasMatches) {
    const topMatch = matchesRes.body[0];
    check('Matching percentage score is backend-generated (> 50%)', topMatch.matchScore > 50);
    console.log(`[MATCH METRICS] Score: ${topMatch.matchScore}%, Category: ${topMatch.categoryScore}%, Location: ${topMatch.locationScore}%, Explanation: ${topMatch.explanation}`);
  }

  // 15. CAMPUS GRAPH & DIJKSTRA SHORTEST PATH
  const dijkstraRes = await req('GET', '/api/campus/shortest-path?from=1&to=7', null, studentXHeaders); // Library (1) to Night Canteen (7)
  check('Dijkstra algorithm calculates shortest route on campus graph', 
    dijkstraRes.status === 200 && dijkstraRes.body.distanceMeters > 0 && Array.isArray(dijkstraRes.body.pathNodes));
  console.log(`[DIJKSTRA ROUTE] Distance: ${dijkstraRes.body.distanceMeters}m via ${dijkstraRes.body.pathNodes?.join(' -> ')}`);

  // 16. STUDENT OWNERSHIP PROTECTION (Security check)
  // Another user tries to cancel Student X's lost item
  const otherStudentToken = (await req('POST', '/api/auth/student/login', {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    password: 'student123'
  })).body.token;

  const unauthorizedCancel = await req('PUT', `/api/lost/${lostId}/cancel`, null, {
    'Authorization': 'Bearer ' + otherStudentToken
  });
  check('Student cannot modify or cancel another student request (HTTP 400 Unauthorized check)', unauthorizedCancel.status === 400);

  // 17. ADMIN AUTHORIZATION SECURITY
  const studentTryAdminApi = await req('GET', '/api/admin/pending-students', null, studentXHeaders);
  check('Student cannot call Admin-only protected endpoints (HTTP 403 Forbidden)', studentTryAdminApi.status === 403);

  // 18. TRIE PREFIX SEARCH
  const autocomplete = await req('GET', '/api/search/autocomplete?q=mac', null);
  check('Trie prefix search returns autocomplete suggestions for "mac"', 
    autocomplete.status === 200 && Array.isArray(autocomplete.body) && autocomplete.body.includes('macbook'));

  // 19. ADMIN STATISTICS & METRICS AUDIT
  const adminStats = await req('GET', '/api/admin/statistics', null, { 'Authorization': 'Bearer ' + admin1Token });
  check('Admin Statistics reflect real-time counts across campus', 
    adminStats.status === 200 && adminStats.body.totalUsers > 0 && adminStats.body.totalLostItems > 0);

  // 20. LOGOUT & INVALIDATION
  const invalidTokenReq = await req('GET', '/api/auth/me', null, { 'Authorization': 'Bearer unauthenticated_token' });
  check('Invalid/expired token returns 401 Unauthorized', invalidTokenReq.status === 401);

  console.log('================================================================');
  console.log(`AUDIT FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Audit crashed with error:', err);
  process.exit(1);
});
