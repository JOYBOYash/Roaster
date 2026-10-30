# Spotify setup for Roastie

Roastie uses Spotify's Authorization Code with PKCE flow. It never asks for a Spotify password, does not ship a client secret, and keeps access/refresh tokens in JavaScript memory for the current tab only. The PKCE verifier and OAuth state are kept in session storage only during the redirect round-trip.

## 1. Create and configure the Spotify app

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app with Web API enabled.
2. Copy the **Client ID**. Do not add a Spotify client secret to this project.
3. Add every exact redirect URI that you will use, including the trailing slash if one is shown. The default redirect is the current site's origin plus `/`. For example, production might use `https://your-domain.example/`, local development might use `http://127.0.0.1:5173/`, and AI Studio needs its own stable hosted origin.
4. In the hosting/build environment, set `VITE_SPOTIFY_CLIENT_ID` to that public Client ID. Set `VITE_SPOTIFY_REDIRECT_URI` only if you want to override the default redirect URI. Rebuild/redeploy after changing Vite environment values.

The Spotify Client ID is public; it is not a secret. Keep `GEMINI_API_KEY` server-side and never prefix it with `VITE_`.

## 2. Permissions requested

- **Top 5 tracks:** requests only `user-top-read` and reads `GET /v1/me/top/tracks?time_range=long_term&limit=5`.
- **Saved favourites:** requests only `user-library-read` and reads five saved tracks.

The app asks for the minimum permission required for the chosen source. Changing sources may send the user through Spotify authorization again.

## 3. Token and data handling

- OAuth uses a cryptographically random PKCE verifier and a checked `state` value.
- Access and refresh tokens exist only in page memory. They are not written to localStorage or sent to Roastie's server.
- Roastie sends only the selected track/artist text and chosen roast preset to Gemini to generate the joke.
- The last 10 generated roasts and their source list are kept in this browser's localStorage. The user can export them as JSON or clear the local history. No roast-history database is used.
- Clearing the in-tab token does not revoke the app's consent at Spotify. To revoke consent, open Spotify's [Apps page](https://www.spotify.com/account/apps/) and remove Roastie access.

## 4. Spotify Development Mode limits

Spotify's current Development Mode rules require the app owner to have Premium and limit a new app to five users. This is useful for owner testing, but won't support a public audience beyond that cap. A public launch requires meeting Spotify's current extended-quota requirements; do not try to bypass the restriction with unofficial scraping.

## 5. Troubleshooting

- `Spotify is not configured yet`: set `VITE_SPOTIFY_CLIENT_ID` in the build environment and rebuild.
- `INVALID_CLIENT` / redirect mismatch: compare the exact redirect URI used by the app with the URI allowlist in Spotify's Developer Dashboard.
- `403`: check that the signed-in Spotify account is allowed to use the app and that the requested scope is approved.
- `401`: connect Spotify again; the token is intentionally not persisted across a page reload.
- `/api/health` returns HTML/404 on Vercel: inspect the deployment and function logs. The `api/` functions should be deployed alongside the Vite front end.
