'use strict';
// Generic Privacy Policy and Terms of Service pages for Blob Scorer.
// Set CONTACT_EMAIL in the environment so people know who to contact.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CONTACT = process.env.CONTACT_EMAIL || '';
const contact = CONTACT ? `<a href="mailto:${esc(CONTACT)}">${esc(CONTACT)}</a>` : 'the person who runs this app';
const UPDATED = '30 September 2026';

const shell = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Blob Scorer</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#123a2c;color:#14231c;font:16px/1.55 system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:16px 14px 48px}
.card{background:#f2f5f2;border-radius:10px;padding:20px 22px}
h1{font:700 1.8rem Georgia,serif;margin:0 0 4px}
h2{font:700 1.1rem Georgia,serif;margin:22px 0 6px}
p,li{margin:6px 0}ul{padding-left:22px}
.mut{color:#5f7268;font-size:.9rem}
a{color:#1d7a4d}
.back{display:inline-block;margin:0 0 12px;color:#f2f5f2}
</style></head><body><main>
<a class="back" href="/">← Back to the app</a>
<div class="card">
<h1>${title}</h1>
<p class="mut">Last updated: ${UPDATED}</p>
${body}
</div></main></body></html>`;

const privacy = shell('Privacy Policy', `
<p>Blob Scorer is a score-keeping app for the card game Blob. This policy explains what information it handles and why. It is run by a private individual, not a company. You can reach them at ${contact}.</p>

<h2>What is collected</h2>
<ul>
<li><b>If you sign in with Google:</b> your name, email address and Google account identifier, as provided by Google. Your password is never seen by this app.</li>
<li><b>Game data you enter:</b> player names, bids, tricks won, scores, results and the history of finished games.</li>
<li><b>Technical data:</b> the server, or a proxy in front of it, may keep routine logs such as IP address and time of request, used only to keep the service running and secure.</li>
</ul>
<p>The app does not collect payment details, your location or your contacts, and it has no advertising or analytics tools.</p>

<h2>If you don't sign in</h2>
<p>Your current game and history are kept only in your own browser's storage. They are not sent to the server.</p>

<h2>How information is used</h2>
<p>Your information is used only to sign you in and to save and show your games and history. It is not sold, not used for advertising, and not shared with other users of the app. It may be disclosed if the law requires it.</p>

<h2>Cookies and browser storage</h2>
<p>When you sign in, one essential session cookie keeps you signed in for up to 30 days. Your browser's local storage holds your current game and history so the app works quickly. There are no tracking or advertising cookies.</p>

<h2>Third parties</h2>
<p>Signing in loads a script from Google, and Google processes the sign-in under its own <a href="https://policies.google.com/privacy" rel="noopener">Privacy Policy</a>. The app is hosted on infrastructure chosen by whoever runs it.</p>

<h2>Keeping and deleting your data</h2>
<p>Data is kept until you delete it. In the app you can delete individual games or clear all history. Signing out removes the copy stored in your browser. To have your account and everything saved with it removed from the server, contact ${contact}.</p>

<h2>Security</h2>
<p>Reasonable steps are taken to protect stored data, but no system is completely secure. Player names you enter may be other people's names, so please only enter names you are comfortable saving.</p>

<h2>Children</h2>
<p>The app is not directed at children under 13, and it does not knowingly collect their personal information.</p>

<h2>Changes and contact</h2>
<p>This policy may be updated from time to time, and the date above will change when it is. Questions or requests: ${contact}.</p>
`);

const terms = shell('Terms of Service', `
<p>By using Blob Scorer you agree to these terms. If you don't agree, please don't use the app.</p>

<h2>The service</h2>
<p>Blob Scorer is a free, informal tool for keeping score in the card game Blob. It is provided for personal, non-commercial use. Its scoring and tie-break rules may not match your house rules.</p>

<h2>Accounts</h2>
<p>You can use the app without an account, or sign in with Google to save games and history on the server. Access may be limited to approved accounts. You are responsible for activity under your account.</p>

<h2>Acceptable use</h2>
<p>Please don't misuse the app. That includes trying to break, overload or gain unauthorised access to it or to other people's data, or entering unlawful or abusive content, such as in player names.</p>

<h2>Your data</h2>
<p>You keep ownership of what you enter. You give the operator permission to store and display it as needed to run the service for you. See the <a href="/privacy">Privacy Policy</a> for details.</p>

<h2>Availability and changes</h2>
<p>The app may change, be interrupted or be shut down at any time, and data may be lost. Don't rely on it for anything important, and keep your own record of results you care about.</p>

<h2>No warranty</h2>
<p>The app is provided "as is" and "as available", without warranties of any kind, whether express or implied, including accuracy, reliability or fitness for a particular purpose.</p>

<h2>Limit of liability</h2>
<p>To the fullest extent permitted by law, the operator is not liable for any loss or damage arising from your use of, or inability to use, the app.</p>

<h2>Ending access</h2>
<p>Access to an account may be suspended or removed at any time, including for breaking these terms. You can stop using the app at any time.</p>

<h2>Changes and contact</h2>
<p>These terms may be updated from time to time. Continuing to use the app after a change means you accept the updated terms. Questions: ${contact}.</p>
`);

module.exports = { privacy, terms };
