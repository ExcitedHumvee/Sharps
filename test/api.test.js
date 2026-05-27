const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.TEST_PORT || 3099;
const BASE = `http://localhost:${PORT}`;
let server;
let cookie = '';
let testSharpId = '';

const results = [];

function log(level, msg) {
    const prefix = { pass: 'PASS', fail: 'FAIL', info: 'INFO', warn: 'WARN' };
    const out = `[${prefix[level]}] ${msg}`;
    console.log(out);
    results.push({ level, msg });
}

function request(method, urlPath, opts = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlPath, BASE);
        const headers = { ...opts.headers };
        if (cookie) headers['Cookie'] = cookie;

        const body = opts.body || null;
        if (body && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        const req = http.request(url, { method, headers, timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                if (res.headers['set-cookie']) {
                    cookie = res.headers['set-cookie']
                        .map((c) => c.split(';')[0])
                        .join('; ');
                }
                const redirect = res.headers.location || '';
                resolve({
                    status: res.statusCode,
                    redirect,
                    body: data,
                    headers: res.headers,
                });
            });
        });
        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

async function test(name, fn) {
    process.stdout.write(`  ${name}... `);
    try {
        const result = await fn();
        if (result === true || result === undefined) {
            log('pass', name);
        } else {
            log('fail', `${name} => ${result}`);
        }
    } catch (e) {
        log('fail', `${name} => ${e.message}`);
    }
}

function startServer() {
    return new Promise((resolve, reject) => {
        const env = { ...process.env, PORT: String(PORT), NODE_ENV: 'test' };
        server = spawn('node', ['app.js'], {
            cwd: path.join(__dirname, '..'),
            env,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        server.stdout.on('data', (d) => {
            const out = d.toString();
            if (out.includes('Serving on port')) {
                resolve();
            }
        });
        server.stderr.on('data', (d) => {
            const err = d.toString();
            if (err.trim()) process.stderr.write(`  [server] ${err}`);
        });
        server.on('error', reject);
        setTimeout(() => reject(new Error('Server start timeout')), 15000);
    });
}

function stopServer() {
    if (server) server.kill('SIGTERM');
}

async function run() {
    console.log('\n=== Sharps API Test Suite ===\n');

    // ---- Start Server ----
    console.log('Starting server...');
    await startServer();
    log('info', `Server running on port ${PORT}`);
    await new Promise((r) => setTimeout(r, 2000));

    // ---- Public Pages ----
    console.log('\n--- Public Pages ---');
    await test('GET / (home)', async () => {
        const r = await request('GET', '/');
        if (r.status !== 200) return `status ${r.status}`;
        if (!r.body.includes('Sharps')) return 'missing "Sharps" in body';
    });

    await test('GET /login', async () => {
        const r = await request('GET', '/login');
        if (r.status !== 200) return `status ${r.status}`;
        if (!r.body.includes('Login')) return 'missing login form';
    });

    await test('GET /register', async () => {
        const r = await request('GET', '/register');
        if (r.status !== 200) return `status ${r.status}`;
        if (!r.body.includes('Register')) return 'missing register form';
    });

    // ---- Register ----
    console.log('\n--- Registration ---');
    const testUser = `testuser_${Date.now()}`;
    const testEmail = `${testUser}@test.com`;
    const testPass = 'testpass123';

    await test(`POST /register (${testUser})`, async () => {
        const r = await request('POST', '/register', {
            body: `username=${testUser}&email=${encodeURIComponent(testEmail)}&password=${testPass}`,
        });
        if (r.status === 302 && r.redirect === '/sharps') return;
        return `status ${r.status}, redirect: ${r.redirect}`;
    });

    await test('Register stores session cookie', async () => {
        if (!cookie) return 'no cookie set';
    });

    // ---- Auth Protection ----
    console.log('\n--- Auth Protection ---');
    const savedCookie = cookie;
    cookie = '';

    await test('GET /sharps/new (no auth) -> redirect to /login', async () => {
        const r = await request('GET', '/sharps/new');
        if (r.status === 302 && r.redirect === '/login') return;
        return `expected redirect to /login, got status ${r.status}`;
    });

    cookie = savedCookie;

    // ---- Authenticated Pages ----
    console.log('\n--- Authenticated Pages ---');
    await test('GET /sharps/new (auth)', async () => {
        const r = await request('GET', '/sharps/new');
        if (r.status !== 200) return `status ${r.status}`;
        if (!r.body.includes('New Sharp')) return 'missing form';
    });

    // ---- Sharps CRUD ----
    console.log('\n--- Sharps CRUD ---');
    await test('GET /sharps', async () => {
        const r = await request('GET', '/sharps');
        if (r.status !== 200) return `status ${r.status}`;
        if (!r.body.includes('All Sharps')) return 'missing content';

        // Extract a sharp ID for detail view testing
        const m = r.body.match(/\/sharps\/([a-f0-9]{24})/);
        if (m) testSharpId = m[1];
    });

    if (testSharpId) {
        await test(`GET /sharps/${testSharpId}`, async () => {
            const r = await request('GET', `/sharps/${testSharpId}`);
            if (r.status !== 200) return `status ${r.status}`;
            if (r.body.length < 500) return 'body too short';
        });

        await test(`POST /sharps/${testSharpId}/reviews (create review)`, async () => {
            const r = await request('POST', `/sharps/${testSharpId}/reviews`, {
                body: `review[rating]=4&review[body]=Test+review+from+automated+tests`,
            });
            if (r.status === 302) return;
            return `status ${r.status}`;
        });
    } else {
        log('warn', 'No sharps found in DB, skipping detail/review tests');
    }

    // ---- Logout ----
    console.log('\n--- Logout ---');
    await test('GET /logout', async () => {
        const r = await request('GET', '/logout');
        if (r.status === 302) return;
        return `status ${r.status}`;
    });

    // ---- Protected after logout ----
    cookie = '';
    await test('GET /sharps/new (after logout) -> redirect', async () => {
        const r = await request('GET', '/sharps/new');
        if (r.status === 302 && r.redirect === '/login') return;
        return `expected redirect to /login, got status ${r.status}`;
    });

    // ---- Error Handling ----
    console.log('\n--- Error Handling ---');
    await test('GET /nonexistent -> 404', async () => {
        const r = await request('GET', '/nonexistent');
        if (r.status !== 404) return `status ${r.status}`;
    });

    await test('GET /sharps/invalidid -> error or redirect', async () => {
        const r = await request('GET', '/sharps/notavalidid1234567890');
        if ([302, 404, 500].includes(r.status)) return;
        return `unexpected status ${r.status}`;
    });

    // ---- Rate Limiting ----
    console.log('\n--- Rate Limiting ---');
    await test('Rate limit headers present', async () => {
        const r = await request('GET', '/');
        const rtHeaders = Object.keys(r.headers).filter((h) => h.includes('rate'));
        if (rtHeaders.length > 0) return;
        return `missing rate-limit header (found: ${Object.keys(r.headers).slice(0, 10).join(', ')})`;
    });

    // ---- CSP Security Headers ----
    console.log('\n--- Security Headers ---');
    await test('Content-Security-Policy header present', async () => {
        const r = await request('GET', '/');
        if (r.headers['content-security-policy']) return;
        return 'missing CSP header';
    });

    await test('X-Content-Type-Options: nosniff', async () => {
        const r = await request('GET', '/');
        if (r.headers['x-content-type-options'] === 'nosniff') return;
        return `got: ${r.headers['x-content-type-options']}`;
    });

    // ---- Summary ----
    console.log('\n=== Test Summary ===\n');
    const passes = results.filter((r) => r.level === 'pass').length;
    const fails = results.filter((r) => r.level === 'fail').length;
    const warns = results.filter((r) => r.level === 'warn').length;
    const total = passes + fails + warns;

    console.log(`Total: ${total} | Passed: ${passes} | Failed: ${fails} | Warnings: ${warns}`);
    if (fails > 0) console.log('\nFailures:');
    results.filter((r) => r.level === 'fail').forEach((r) => console.log(`  - ${r.msg}`));

    stopServer();
    process.exit(fails > 0 ? 1 : 0);
}

run().catch((e) => {
    console.error('Fatal error:', e.message);
    stopServer();
    process.exit(1);
});
