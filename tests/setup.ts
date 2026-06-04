// Force in-memory SQLite for all tests — must run before any module import
process.env.DB_PATH = ':memory:';
