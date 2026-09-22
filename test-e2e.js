/**
 * MYbomma Realtime Production Cinema Platform
 * Complete End-to-End Test Suite for all 7 API Groups and 10 Security/QA Benchmark Scenarios
 */

import http from 'http';

const BASE_URL = 'http://127.0.0.1:5000';

function makeRequest(path, options = {}, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const bodyData = options.body
      ? typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : null;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (bodyData) {
      headers['Content-Length'] = Buffer.byteLength(bodyData);
    }
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let data = {};
          try {
            data = JSON.parse(body);
          } catch {
            data = { raw: body };
          }
          const setCookie = res.headers['set-cookie'];
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data,
            cookie: setCookie ? setCookie.join('; ') : '',
          });
        });
      }
    );

    req.on('error', reject);

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

function extractSessionCookie(cookieHeader) {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(/mybomma_session=([^;]+)/);
  return match ? `mybomma_session=${match[1]}` : '';
}

function extractSessionId(cookieHeader) {
  if (!cookieHeader) return '';
  const match = cookieHeader.match(/mybomma_session=([^;]+)/);
  return match ? match[1] : '';
}

async function runTests() {
  console.log('🎬 ========================================================');
  console.log('🎬 STARTING MYbomma COMPREHENSIVE E2E BENCHMARK SUITE');
  console.log('🎬 ========================================================\n');

  let rohanCookie = '';
  let memberCookie = '';
  let adminCookie = '';
  let testMovieId = '';
  let testPlanId = '';
  const uniqueTestEmail = `benchmark_${Date.now()}@testcinema.com`;

  try {
    // -------------------------------------------------------------
    // TEST 1: API 7 — System & Telemetry (Public)
    // -------------------------------------------------------------
    console.log('▶ TEST 1: System Telemetry & Health Checks');
    const health = await makeRequest('/api/system/health');
    if (health.status !== 200 || health.data.status !== 'healthy') {
      throw new Error(`Health check failed: ${JSON.stringify(health.data)}`);
    }
    console.log(`  ✓ System Health OK: uptime=${health.data.uptime}, diskLock=${health.data.diskWriteLock}`);

    const info = await makeRequest('/api/system/info');
    if (info.status !== 200 || info.data.platform !== 'MYbomma') {
      throw new Error(`System info failed: ${JSON.stringify(info.data)}`);
    }
    console.log(`  ✓ System Info OK: platform=${info.data.platform}, codecs=${info.data.videoCodecs.join(', ')}`);

    // -------------------------------------------------------------
    // TEST 2: Gated Movie Catalog (Unauthenticated requests blocked)
    // -------------------------------------------------------------
    console.log('\n▶ TEST 2: Gated Catalog Security (Unauthenticated = 401)');
    const unauthMovies = await makeRequest('/api/movies');
    if (unauthMovies.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated /api/movies, got ${unauthMovies.status}`);
    }
    console.log('  ✓ Catalog is strictly locked behind authentication (401 received)');

    // -------------------------------------------------------------
    // TEST 3: Primary Customer Rohan Verification (Secure Password)
    // -------------------------------------------------------------
    console.log('\n▶ TEST 3: Primary Customer Login (Rohan Verma) with Enterprise Password');
    const rohanLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'rohan@mybomma.com', password: 'Rohan#Member$Cinema2026!' }
    });

    if (rohanLogin.status !== 200 || !rohanLogin.data.success) {
      throw new Error(`Rohan login failed: ${JSON.stringify(rohanLogin.data)}`);
    }
    rohanCookie = extractSessionCookie(rohanLogin.cookie);
    if (!rohanCookie) {
      throw new Error('No session cookie returned for Rohan');
    }
    if (rohanLogin.data.user.name !== 'Rohan Verma') {
      throw new Error(`Expected customer name Rohan Verma, got ${rohanLogin.data.user.name}`);
    }
    console.log(`  ✓ Primary Customer verified: ${rohanLogin.data.user.name} (UUID: ${rohanLogin.data.user.id})`);

    // -------------------------------------------------------------
    // TEST 4: Member Registration & Random High-Entropy UUIDs
    // -------------------------------------------------------------
    console.log('\n▶ TEST 4: New Subscriber Registration & UUID Validation');
    const signupRes = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        name: 'Aarav Mehta',
        email: uniqueTestEmail,
        password: 'SecurePassword@2026!',
        phone: '+91 9123499999'
      }
    });

    if (signupRes.status !== 201 || !signupRes.data.success) {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
    }
    memberCookie = extractSessionCookie(signupRes.cookie);
    const newUserId = signupRes.data.user.id;
    // Verify UUID format (standard 36 chars)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newUserId)) {
      throw new Error(`Expected UUIDv4 format for new user, got: ${newUserId}`);
    }
    console.log(`  ✓ Account registered with high-entropy UUID: ${signupRes.data.user.name} (${newUserId})`);

    // Verify /api/auth/me
    const meRes = await makeRequest('/api/auth/me', {}, memberCookie);
    if (meRes.status !== 200 || meRes.data.user.passwordHash) {
      throw new Error('Failed to verify session or passwordHash was exposed');
    }
    console.log('  ✓ /api/auth/me verified. passwordHash is sanitized.');

    // -------------------------------------------------------------
    // SCENARIO 2: Session Key Persistence across login
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 2: Session Key Persistence Check');
    const initialSessionId = extractSessionId(memberCookie);
    const reLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: uniqueTestEmail, password: 'SecurePassword@2026!' }
    }, memberCookie);

    const reLoginSessionId = extractSessionId(reLogin.cookie);
    if (reLoginSessionId !== initialSessionId) {
      throw new Error(`Expected session ID ${initialSessionId} to persist, but got ${reLoginSessionId}`);
    }
    console.log(`  ✓ Session Key Persistence verified: session ID preserved across login (${reLoginSessionId})`);

    // -------------------------------------------------------------
    // SCENARIO 1 & 7: Catalog Querying, Metadata Disclosure & Search Reflection
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIOS 1 & 7: Movie Metadata & Unsanitized Search Reflection');
    const moviesRes = await makeRequest('/api/movies', {}, memberCookie);
    if (moviesRes.status !== 200 || !Array.isArray(moviesRes.data.movies)) {
      throw new Error('Failed to fetch movies with authenticated session');
    }

    // Check Scenario 1: Movie list omits videoUrl
    const firstMovieSummary = moviesRes.data.movies[0];
    if (firstMovieSummary.videoUrl !== undefined) {
      throw new Error('Movie list unexpectedly exposed videoUrl');
    }
    testMovieId = firstMovieSummary.id;

    // Check Scenario 1: Movie details includes videoUrl
    const movieDetailRes = await makeRequest(`/api/movies/${testMovieId}`, {}, memberCookie);
    if (!movieDetailRes.data.movie?.videoUrl) {
      throw new Error('Movie details lookup did not disclose videoUrl');
    }
    console.log(`  ✓ Scenario 1 verified: List omits videoUrl, detailed lookup discloses ${movieDetailRes.data.movie.videoUrl}`);

    // Check Scenario 7: Search parameter reflection
    const searchXssPayload = '<img src=x onerror=alert(1)>';
    const searchRes = await makeRequest(`/api/movies?search=${encodeURIComponent(searchXssPayload)}`, {}, memberCookie);
    if (searchRes.data.query !== searchXssPayload) {
      throw new Error(`Expected reflected query "${searchXssPayload}", got "${searchRes.data.query}"`);
    }
    console.log(`  ✓ Scenario 7 verified: Unsanitized search reflection returned in query: "${searchRes.data.query}"`);

    // -------------------------------------------------------------
    // SCENARIO 9: Unchecked Tier Constraints on Streams
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 9: Unchecked Tier Constraints on Streams');
    // Aarav currently has basic subscription, request a high-tier movie stream (e.g. Jawan / Super Cinema)
    const streamRes = await makeRequest(`/api/movies/${testMovieId}/stream`, {}, memberCookie);
    if (streamRes.status !== 200 || !streamRes.data.stream?.streamUrl) {
      throw new Error(`Scenario 9 failed: Expected stream to be authorized regardless of tier, got ${streamRes.status}`);
    }
    console.log(`  ✓ Scenario 9 verified: Basic subscriber streamed "${streamRes.data.stream.title}" (${streamRes.data.stream.streamUrl})`);

    // -------------------------------------------------------------
    // SCENARIO 3 & 6: Unverified Plan Price & Client-Specified Expiration
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 3 & 6: Unverified Plan Price & Client-Specified Expiration');
    const plansRes = await makeRequest('/api/subscriptions/plans', {}, memberCookie);
    testPlanId = plansRes.data.plans[1].id; // Super Cinema plan

    const arbitraryPrice = 100; // 100 paise = ₹1.00
    const arbitraryExpiry = '2099-12-31T23:59:59.000Z';

    const customSubRes = await makeRequest('/api/subscriptions/subscribe', {
      method: 'POST',
      body: {
        planId: testPlanId,
        paymentMethod: 'Test Card',
        amount: arbitraryPrice,
        customExpiresAt: arbitraryExpiry
      }
    }, memberCookie);

    if (customSubRes.status !== 201) {
      throw new Error(`Subscription failed: ${JSON.stringify(customSubRes.data)}`);
    }
    if (customSubRes.data.order.amount !== arbitraryPrice) {
      throw new Error(`Expected arbitrary amount ${arbitraryPrice}, got ${customSubRes.data.order.amount}`);
    }
    if (customSubRes.data.subscription.expiresAt !== arbitraryExpiry) {
      throw new Error(`Expected custom expiration ${arbitraryExpiry}, got ${customSubRes.data.subscription.expiresAt}`);
    }
    console.log(`  ✓ Scenario 3 verified: Accepted custom amount of ${customSubRes.data.order.amount} paise (₹1.00)`);
    console.log(`  ✓ Scenario 6 verified: Accepted client-specified expiration: ${customSubRes.data.subscription.expiresAt}`);

    // -------------------------------------------------------------
    // SCENARIO 8: Secondary Field Notes Propagation
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 8: Secondary Field Notes Propagation');
    const customNotes = 'Special VIP Member Note <script>console.log("note")</script>';
    const addWithNotes = await makeRequest(`/api/watchlist/${testMovieId}`, {
      method: 'POST',
      body: { notes: customNotes }
    }, memberCookie);

    if (addWithNotes.status !== 201 || addWithNotes.data.notes !== customNotes) {
      throw new Error(`Watchlist notes failed: ${JSON.stringify(addWithNotes.data)}`);
    }

    // Admin login with secure password
    const adminLogin = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@mybomma.com', password: 'Director@MYbomma#Ultra2026!' }
    });
    if (adminLogin.status !== 200) {
      throw new Error('Admin login failed');
    }
    adminCookie = extractSessionCookie(adminLogin.cookie);

    const adminDash = await makeRequest('/api/admin/dashboard', {}, adminCookie);
    const feedItem = adminDash.data.recentMemberActions?.find(a => a.notes === customNotes);
    if (!feedItem) {
      throw new Error('Watchlist note did not propagate to admin dashboard recentMemberActions feed');
    }
    console.log(`  ✓ Scenario 8 verified: Note propagated to admin feed: "${feedItem.notes}"`);

    // -------------------------------------------------------------
    // SCENARIO 4: User-Scoped ID Ingestion on Deletion
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 4: User-Scoped ID Ingestion on Deletion');
    // Call delete with targetUserId pointing to Aarav from another session or body override
    const deleteRes = await makeRequest(`/api/watchlist/${testMovieId}`, {
      method: 'DELETE',
      body: { targetUserId: newUserId }
    }, rohanCookie); // Rohan makes the request targeting Aarav's item

    if (deleteRes.status !== 200 || deleteRes.data.targetUserId !== newUserId) {
      throw new Error(`Targeted watchlist deletion failed: ${JSON.stringify(deleteRes.data)}`);
    }

    // Check Aarav's watchlist to ensure it was deleted
    const aaravWatchlist = await makeRequest('/api/watchlist', {}, memberCookie);
    if (aaravWatchlist.data.watchlist.some(w => w.movieId === testMovieId)) {
      throw new Error("Target user's watchlist item was not removed");
    }
    console.log(`  ✓ Scenario 4 verified: Target user's item successfully deleted via targetUserId ingestion`);

    // -------------------------------------------------------------
    // SCENARIO 5: Unfiltered Property Merging in PUT /api/user/profile
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 5: Unfiltered Property Merging (Privilege Escalation via mass assignment)');
    const profileUpdateRes = await makeRequest('/api/user/profile', {
      method: 'PUT',
      body: {
        role: 'admin',
        customAuditTag: 'SECURITY_BENCHMARK_VERIFIED'
      }
    }, memberCookie);

    if (profileUpdateRes.status !== 200 || profileUpdateRes.data.profile.role !== 'admin') {
      throw new Error(`Unfiltered property merge failed: ${JSON.stringify(profileUpdateRes.data)}`);
    }
    console.log(`  ✓ Scenario 5 verified: User role escalated to '${profileUpdateRes.data.profile.role}' via mass assignment`);

    // -------------------------------------------------------------
    // SCENARIO 10: State Retention Across Cancellation
    // -------------------------------------------------------------
    console.log('\n▶ SCENARIO 10: State Retention Across Cancellation');
    // Cancel subscription
    const cancelRes = await makeRequest('/api/subscriptions/cancel', { method: 'POST' }, memberCookie);
    if (cancelRes.status !== 200) {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelRes.data)}`);
    }
    console.log('  ✓ Subscription canceled in runtime database.');

    // Attempt video streaming within the same session
    const postCancelStream = await makeRequest(`/api/movies/${testMovieId}/stream`, {}, memberCookie);
    if (postCancelStream.status !== 200 || !postCancelStream.data.stream?.streamUrl) {
      throw new Error(`Scenario 10 failed: Expected stream to remain active from session cache, got ${postCancelStream.status}`);
    }
    console.log(`  ✓ Scenario 10 verified: Stream remains active in-session after cancellation (${postCancelStream.data.stream.title})`);

    // -------------------------------------------------------------
    // TEST: User Suspension & Instant Session Purge
    // -------------------------------------------------------------
    console.log('\n▶ FINAL CHECK: Account Suspension & Instant Session Purge');
    await makeRequest(`/api/admin/users/${newUserId}/status`, {
      method: 'PATCH',
      body: { status: 'suspended' }
    }, adminCookie);

    const purgedSessionCheck = await makeRequest('/api/auth/me', {}, memberCookie);
    if (purgedSessionCheck.status !== 401 && purgedSessionCheck.status !== 403) {
      throw new Error(`Expected 401 or 403 after suspension, got ${purgedSessionCheck.status}`);
    }
    console.log('  ✓ Member session instantly purged! Access revoked immediately.');

    console.log('\n========================================================');
    console.log('🎉 ALL 10 QA BENCHMARK SCENARIOS & TESTS PASSED PERFECTLY!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runTests();

