# Blob Scorer

A scoring app for the card game Blob, for 2 to 6 players. It tracks each player's nomination, scores rounds (1 point for a bid made, 0 for a "blob"), breaks ties on tricks won in scored rounds, and keeps a win history. Sign in with Google to store games and history on the server; without signing in, data stays in the browser.

## Deploy with Portainer (from this repo)

1. In Portainer, go to **Stacks > Add stack** and choose **Repository**.
2. Enter this repository's URL and the branch (for example `refs/heads/main`). For a private repo, turn on authentication and use a personal access token.
3. Set **Compose path** to `docker-compose.yml`.
4. Under **Environment variables**, add:

   | Name | Purpose |
   |---|---|
   | `GOOGLE_CLIENT_ID` | Google OAuth Web client ID (empty turns sign-in off) |
   | `ALLOWED_EMAILS` | Optional comma-separated list of allowed Google accounts |
   | `CONTACT_EMAIL` | Optional, shown on the Privacy Policy and Terms pages |
   | `BLOB_PORT` | Optional host port (default 8082) |

5. Click **Deploy the stack**. The image is built from the repository's `Dockerfile`.
6. To update later, push to the repository, then open the stack and use **Pull and redeploy**. Portainer can also check the repository on a schedule or by webhook under **GitOps updates**.

Data is stored in the `blob-data` Docker volume, so it survives rebuilds and redeploys.

## Google sign-in

1. In Google Cloud Console, create an OAuth client ID of type **Web application**.
2. Add the address you open the app at (for example `https://blob.example.com`) under **Authorized JavaScript origins**. Google accepts only `localhost` or HTTPS addresses.
3. Put the client ID in `GOOGLE_CLIENT_ID`.

Run the app behind HTTPS (a reverse proxy or tunnel) that forwards `X-Forwarded-Proto`, so the login cookie is marked Secure.

## Run locally

```
cp .env.example .env   # fill in values
docker compose up -d --build
```

Then open http://localhost:8082.
