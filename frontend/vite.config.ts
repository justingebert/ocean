import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import istanbul from "vite-plugin-istanbul"
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
    // Read .env from the repo root so it stays the single source of truth
    // for compose, the backend container, and the SPA.
    envDir: path.resolve(__dirname, '..'),
    server: {
        fs: {
            allow: ['.']
        },
        // Dev server matches prod's relative-/v1 strategy. SPA calls `/v1/...`
        // and Vite forwards to the backend that `sbt run` exposes on :9000.
        proxy: {
            '/v1': 'http://localhost:9000',
        },
    },
    plugins: [
      react(),
      tailwindcss(),
      istanbul({
          include: "src/*", // Specify directories to instrument
          exclude: ["node_modules", "test/*", "cypress/*"],
          extension: [".ts", ".tsx"], // Extensions to instrument
          cypress: true, // Enable coverage for Cypress
          forceBuildInstrument: true,
      })
    ],
})
