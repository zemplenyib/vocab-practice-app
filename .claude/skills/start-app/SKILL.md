Start the vocab practice app development servers and open the browser.

Run these commands, always prefixing with `cd /d/repos/vocab-practice-app &&` to ensure the correct working directory:
1. `cd /d/repos/vocab-practice-app && npm exec pnpm dev:api` in the background (API server on port 3000)
2. `cd /d/repos/vocab-practice-app && npm exec pnpm dev:web` in the background (frontend, usually port 5173)
3. After 4 seconds, check the output to see which port Vite picked, then run `start http://localhost:<port>` to open the browser (Windows)

Report which ports the servers started on.
