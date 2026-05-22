const path = require('path');
const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
    root: path.resolve(__dirname),
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./tests/setup.js'],
        testTimeout: 30000,
        fileParallelism: false,
        watch: false,
    },
});
