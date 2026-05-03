import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom', // Simulate a browser environment for React
        setupFiles: './vitest.setup.ts', // Optional: Setup file for global imports
        globals: true, // Enable Jest-like globals (e.g., describe, it, expect)
        coverage: {
            provider: "istanbul",
            reportsDirectory: "./coverage/vitest", // Save Vitest reports separately
            reporter: ["text", "html", "json", "json-summary"], // Include JSON reporters for merging
            all: true, // Collect coverage for all files, even if they're not tested
        },
    },
});
