// Runs before every test file, before the app modules are imported.
process.env.NODE_ENV = 'test';
process.env.SHORT_LINK_BASE_URL = 'https://tap.test';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret-test-secret';
process.env.GUEST_LINK_TTL_DAYS = '90';
process.env.REDIRECT_MODE = 'http';
process.env.REPORT_AUTO_DISABLE_THRESHOLD = '2';
delete process.env.SMTP_HOST;
