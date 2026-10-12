// Test env must be set BEFORE app/env modules are imported.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-test-secret-test-secret';
process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/spms_test_placeholder';
