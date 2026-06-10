# ServeAI — Revised Master Plan
### Updated May 28, 2026 | 13 Days Left | Deadline: Submit June 10

---

## FIRST THINGS FIRST — THE NAME PROBLEM

All the generic names are taken. Here are genuinely unique suggestions — each with a meaning and a reason it works for this product.

---

### Name Option 1: BOLO
**Meaning:** "Speak" / "Say it" in Urdu and Hindi
**Brand line:** "Just say it."
**Why it works:** The entire product concept is "you type/say what you need and we handle it." Bolo is the action. It is short (4 letters), globally pronounceable, emotionally direct, and deeply rooted in South Asian culture without feeling regional — "bolo" is also recognizable to anyone who has heard it once. It has an energy to it. The domain bolo.ai or getbolo.com may be available.
**Risk:** There is a children's education app called Bolo by Google (now discontinued). As a service booking product it is clearly distinct.

---

### Name Option 2: QARIB
**Meaning:** "Nearby" / "Close to you" in Arabic and Urdu
**Brand line:** "Whatever you need, it's closer than you think."
**Why it works:** The product's core value is finding real *nearby* providers. Qarib captures that directly and meaningfully. It sounds distinctive in English, is easy to remember after hearing it once, and the meaning is directly tied to the product's purpose. qarib.app is likely available.
**Risk:** Less immediately obvious to non-Urdu speakers but extremely memorable once explained.

---

### Name Option 3: TALAB
**Meaning:** "Request" / "Summon" / "Demand" in Urdu and Arabic
**Brand line:** "You ask. We deliver."
**Why it works:** Talab means both "to request something" and "to summon someone" — both of which are exactly what the app does. It has authority and directness. Short, punchy, memorable. talab.app is likely available.
**Risk:** Slightly less accessible to international markets.

---

### Name Option 4: HANDL
**Meaning:** A stylized form of "Handle" — as in, we handle it for you
**Brand line:** "You ask. We Handl it."
**Why it works:** Completely language-neutral, globally brandable, directly states the value proposition. The missing 'e' makes it feel like a modern tech product name. Works for Pakistan, UAE, Indonesia, Nigeria, Brazil equally.
**Risk:** Need to verify domain availability — tech name style may have been taken.

---

### Name Option 5: ZAPP (not Zap — ZAPP)
**Meaning:** The feeling of something happening instantly
**Brand line:** "Service at the speed of a message."
**Why it works:** Double-P makes it distinct from the taken "Zap". Short, energetic, memorable globally. Feels fast and modern.

---

### ⭐ TOP RECOMMENDATION: BOLO or HANDL
BOLO for a Pakistan-first brand identity that scales globally with a great story behind the name. HANDL for a brand that leads with international appeal from day one. Pick whichever feels more like *you*.

---
---

## THE REVISED 13-DAY PLAN

### How to Read This Plan

Every task is tagged with one of three labels:

🤖 **AI DOES THIS** — Paste the instruction to your AI coding assistant (Gemini Code Assist or GitHub Copilot in VS Code). You review the output and confirm it works.

👤 **YOU DO THIS** — Account creation, clicking buttons in dashboards, recording video, writing descriptions. The AI cannot do these for you.

🤝 **YOU + AI TOGETHER** — You provide context and make decisions; AI writes the code while you guide it.

This split is important. You burned out last time partly because you did not know which tasks to delegate and which required you. Now you know.

---

## DAY 1 — MAY 29 (THURSDAY)
### Goal: All accounts created, laptop clean, "Hello World" server live on the internet

**Time needed: 4–5 hours**

👤 **Laptop cleanup first (45 minutes, no skipping this)**
- Open Task Manager → Startup tab → Disable everything except Windows Defender
- Delete node_modules from all old projects (search for "node_modules" in File Explorer and delete every one)
- Use Edge browser for this entire hackathon, not Chrome
- Restart laptop after cleanup

👤 **Create your accounts (1 hour)**
- Gmail: [yourappname]@gmail.com — this is your startup email forever
- Firebase: console.firebase.google.com → new project → enable Google Sign-In provider → download service account JSON key
- MongoDB Atlas: cloud.mongodb.com → free M0 cluster → create DB user → whitelist 0.0.0.0/0 → copy connection string
- Google Cloud: console.cloud.google.com → new project → activate $100 credits → enable these 4 APIs: Vertex AI API, Places API (New), Cloud Run API, Cloud Build API
- Twilio: twilio.com → free account → WhatsApp Sandbox → connect your WhatsApp number by sending the join code
- GitHub: create repo named after your app, set to public

👤 **Install your tools (30 minutes)**
- Install VS Code if not already installed
- Install GitHub Copilot extension in VS Code (sign in with GitHub)
- Install Gemini Code Assist extension in VS Code (sign in with Google)
- Install Node.js v20 LTS from nodejs.org
- Install ngrok from ngrok.com (free account)

🤖 **AI creates the project structure**

Tell your AI coding assistant this exact prompt:

> "Create a Node.js Express backend project in a folder called 'backend'. Include: package.json with these dependencies: express, mongoose, firebase-admin, @google-cloud/vertexai, @googlemaps/google-maps-services-js, twilio, socket.io, cors, dotenv. Create index.js with a basic Express server on port 8080 with one GET / route that returns 'App backend is running'. Create a .env.example file listing all environment variables from this list: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, MONGODB_URI, GOOGLE_MAPS_API_KEY, VERTEX_AI_LOCATION, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, PORT, FRONTEND_URL. Create a .gitignore that excludes node_modules and .env."

👤 **You fill the .env file** with all your real credentials from the accounts you just created. AI cannot do this — the credentials are yours.

🤝 **Test it together**
- Run `npm install` then `node index.js`
- Open browser at localhost:8080 — you should see "App backend is running"
- If it fails, paste the error to your AI and ask it to fix it

**Day 1 is done when:** You see your server message in a browser at localhost:8080.

---

## DAY 2 — MAY 30 (FRIDAY)
### Goal: Google Sign-In works and creates a user in MongoDB

**Time needed: 4–5 hours**

🤖 **AI creates the React frontend**

Tell AI:
> "Create a React + Vite frontend project in a folder called 'frontend'. Install: firebase, socket.io-client, axios. Create src/firebase.js that initializes Firebase with config from environment variables (VITE_ prefix for Vite). Export auth and googleProvider. Create a .env.example with VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_BACKEND_URL."

🤖 **AI creates the Login component**

Tell AI:
> "Create src/components/Login.jsx. It should render a full-screen dark background (#0F1117) centered container. Show the app name in teal (#00C896) at 28px Plus Jakarta Sans. Show a Google Sign-In button (dark card style, Google G icon, text 'Continue with Google', 52px tall, border-radius 10px). On click, call signInWithPopup(auth, googleProvider) from Firebase. On success, get the Firebase ID token with result.user.getIdToken() and POST it to VITE_BACKEND_URL/api/auth/verify with Authorization: Bearer [token] header. If the returned user has no phone number, navigate to /setup. Otherwise navigate to /home."

🤖 **AI creates the backend auth route**

Tell AI:
> "Create backend/routes/auth.js. POST /api/auth/verify endpoint. Verify the Firebase Bearer token using firebase-admin verifyIdToken. Extract uid, email, name. Call MongoDB User model with findOneAndUpdate using upsert:true to create or retrieve the user document. Return the user document. The User schema has: firebaseUid (string, unique), email, name, phone (optional), createdAt, preferences object with radiusKm (default 5), priceRange (default 'mid'), minRating (default 4.0), defaultArea, defaultLat, defaultLng."

🤝 **Test the full auth flow together**
- Start backend and frontend simultaneously (two terminal windows)
- Click Sign In with Google in the browser
- Check MongoDB Atlas — a new user document should appear

**The most common error today:** CORS. If you see a CORS error in browser console, tell AI: "I'm getting a CORS error when the frontend at localhost:5173 calls the backend at localhost:8080. Fix the CORS configuration in the Express backend."

**Day 2 is done when:** Clicking Sign In creates a real document in your MongoDB Atlas database.

---

## DAY 3 — MAY 31 (SATURDAY)
### Goal: Profile setup screen works and saves to MongoDB

**Time needed: 3–4 hours**

🤖 **AI creates the Profile Setup screen**

Tell AI:
> "Create src/components/ProfileSetup.jsx. Two-step form. Step 1: name input (pre-filled from Firebase user displayName), phone number input with +92 prefix and validation regex /^3[0-9]{9}$/ for Pakistani numbers, area/neighbourhood text input. Step 2: radius slider 1–25km with current value shown, price range selector with three pill buttons (Budget/Mid-range/Premium), minimum rating selector with 5 tappable stars. Next button on Step 1 is disabled until name and phone are valid. Save button on Step 2 PUTs all data to VITE_BACKEND_URL/api/user/profile with Firebase auth token. On success navigate to /home. Styling: dark background #0F1117, surface color #1A1D27, brand teal #00C896 for active elements, Inter font."

🤖 **AI creates the profile update endpoint**

Tell AI:
> "Create PUT /api/user/profile in backend/routes/user.js. Verify Firebase token. Update the user document in MongoDB with the submitted fields: name, phone, preferences.radiusKm, preferences.priceRange, preferences.minRating, preferences.defaultArea. Return the updated user."

**Day 3 is done when:** A new user can complete profile setup and their MongoDB document shows a phone number.

---

## DAY 4 — JUNE 1 (SUNDAY)
### Goal: Google Maps finds real nearby businesses

**Time needed: 3–4 hours**

🤖 **AI creates the Maps service**

Tell AI:
> "Create backend/services/mapsService.js. Export an async function searchNearbyProviders(query, lat, lng, radiusKm, minRating). Use @googlemaps/google-maps-services-js to call the Places API Text Search with the query (e.g. 'plumber'), location lat/lng, and radius in meters (radiusKm * 1000). Filter results to only include places with rating >= minRating. Calculate distance from user to each result using the Haversine formula. Sort by rating descending. Return the top 5 results as objects with: placeId, name, rating, distanceKm (2 decimal places), address, phoneNumber (if available from the API response)."

🤖 **AI creates a test route**

Tell AI:
> "Create GET /api/test/maps in the backend that calls searchNearbyProviders with hardcoded values: query='plumber', lat=31.4697, lng=74.4089 (DHA Lahore), radiusKm=5, minRating=3.5. Return the results as JSON."

👤 **You test it**
- Open browser at localhost:8080/api/test/maps
- You should see real Lahore plumbers with names, ratings, and distances
- If you see real results, Maps integration is complete

**Day 4 is done when:** Real nearby businesses appear in the test route response.

---

## DAY 5 — JUNE 2 (MONDAY)
### Goal: Gemini understands a request and returns 3 provider recommendations with AI explanations

**Time needed: 5–6 hours — this is the hardest day**

🤖 **AI creates the Gemini agent**

Tell AI:
> "Create backend/services/geminiAgent.js. Initialize @google-cloud/vertexai with project ID from env and location us-central1. Use the gemini-2.0-flash model. 
>
> Create an async function processServiceRequest(userRequestText, userPreferences, requestId, providers) where providers is already the array from Google Maps.
>
> Send this system prompt to Gemini: 'You are a service booking AI agent. You will receive a user's service request and a list of nearby providers found via Google Maps. Your job is to: 1) Select the best 3 providers based on the user preferences provided 2) Write one sentence explaining why each provider was selected — be specific about what makes them a good match (rating, proximity, category fit) 3) Return a JSON object with a providers array. Each provider object must include: placeId, name, rating, distanceKm, address, aiExplanation. Return ONLY valid JSON, nothing else.'
>
> Include user preferences and the full provider array in the user message. Parse the JSON response and return it."

🤝 **Test it together**
- Create a temporary test route that calls processServiceRequest with a hardcoded request: "I need a plumber, my kitchen sink is leaking"
- Confirm that Gemini returns 3 providers with real aiExplanation text for each

**The most common error today:** Gemini returning text with markdown code fences (```json) around the JSON. If this happens, tell AI: "Gemini is returning the JSON wrapped in markdown code fences. Add a step to strip any ``` markers before JSON.parse."

**Day 5 is done when:** Gemini returns 3 providers with written explanations for each.

---

## DAY 6 — JUNE 3 (TUESDAY)
### Goal: Full request flow works end-to-end (user types → AI finds providers → results shown in browser)

**Time needed: 5 hours**

🤖 **AI creates the main request endpoint**

Tell AI:
> "Create POST /api/requests/new in backend/routes/requests.js. Verify Firebase token. Get user profile from MongoDB. Accept requestText, lat, lng in request body. Generate a requestId using 'REQ-' + 5 random digits. Call searchNearbyProviders with the user's preferences. Call processServiceRequest with the request text, preferences, requestId, and providers array. Create a new Request document in MongoDB with status 'searching', save the providers array, and set status to 'awaiting_selection'. Return the requestId and the 3 selected providers with their aiExplanations."

🤖 **AI creates the main home screen with chat input**

Tell AI:
> "Create src/components/HomeScreen.jsx. Show the app name at top. Show a chat interface area (scrollable, takes up most of screen). Show a fixed input bar at bottom: text input with placeholder 'What do you need today?', send button in teal (#00C896) that is disabled when input is empty. On send, POST the request text and user's current browser geolocation coordinates to VITE_BACKEND_URL/api/requests/new with Firebase auth header. Show a loading animation (3 pulsing dots in teal) while waiting. When response arrives, display the 3 provider cards."

🤖 **AI creates the Provider Card component**

Tell AI:
> "Create src/components/ProviderCard.jsx. Card with dark background #1A1D27, border-radius 14px, subtle border. Show provider name in 16px bold, aiExplanation in 12px grey, star rating with yellow star icon, distance in teal. Entire card is tappable. On tap, call a onSelect prop with the provider object."

**Day 6 is done when:** You can type "I need a plumber" in the browser and see 3 real provider cards appear.

---

## DAY 7 — JUNE 4 (WEDNESDAY)
### Goal: WhatsApp message sends to provider when user taps a card

**Time needed: 5 hours**

🤖 **AI creates the WhatsApp service**

Tell AI:
> "Create backend/services/whatsappService.js. Initialize Twilio with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN from env. Export async function sendWhatsAppMessage(toPhoneNumber, messageBody). Call client.messages.create with from: 'whatsapp:' + TWILIO_WHATSAPP_FROM, to: 'whatsapp:+92' + toPhoneNumber (adjust prefix as needed), body: messageBody. Return the message SID."

🤖 **AI creates the booking endpoint**

Tell AI:
> "Create POST /api/requests/:requestId/book. Verify Firebase token. Accept selectedProvider object in request body. Retrieve the request from MongoDB. Compose the initial WhatsApp message using this template: '[{requestId}] Hello! A user near {userArea} needs {serviceType} service. Are you available today? Please include [{requestId}] at the start of your reply so we can route it correctly.' Call sendWhatsAppMessage with the provider's phone number and the composed message. Update request status to 'booking'. Save the selected provider to the request document. Return success."

👤 **Start ngrok and update Twilio settings**
- In a terminal run: `ngrok http 8080`
- Copy the https URL it gives you (e.g. https://abc123.ngrok.io)  
- Go to Twilio Console → WhatsApp Sandbox settings
- Set "When a message comes in" webhook to: https://abc123.ngrok.io/webhook/twilio/whatsapp
- Method: POST

🤖 **AI creates the Twilio webhook endpoint**

Tell AI:
> "Create POST /webhook/twilio/whatsapp in backend/routes/webhook.js. NO Firebase auth on this route. Extract Body (message text) and From (sender phone number) from req.body (Twilio sends as URL-encoded form data — add express.urlencoded middleware). Try to extract a Request ID from the message using regex /\[REQ-(\d{5})\]/. If found, find that request in MongoDB and append the inbound message to the conversation array with direction:'inbound'. Update the request status. Return a 200 response with empty TwiML: res.set('Content-Type', 'text/xml'); res.send('<Response></Response>')"

**Day 7 is done when:** Tapping a provider card sends a real WhatsApp message that appears on the provider's phone.

---

## DAY 8 — JUNE 5 (THURSDAY)
### Goal: Live booking feed shows the conversation in real time

**Time needed: 5 hours**

🤖 **AI adds Socket.io to backend**

Tell AI:
> "Add Socket.io to the Express backend. When the server starts, attach Socket.io to the HTTP server. Listen for 'join-request' events from clients — when received, add that socket to a room named after the requestId. When the Twilio webhook receives an inbound message and updates MongoDB, emit a 'conversation-update' event to the room named after that requestId, with the new message object as data."

🤖 **AI creates the Live Booking Feed screen**

Tell AI:
> "Create src/components/BookingFeed.jsx. Accept requestId as a prop. Connect to the Socket.io server at VITE_BACKEND_URL. Join the room for this requestId with socket.emit('join-request', requestId). Show a status bar at top with the provider name and a pulsing green dot labeled 'Booking in progress' and the requestId in monospace font. Below the status bar, show a WhatsApp-styled conversation feed: outbound messages (direction:'outbound') as green bubbles on the right labeled 'ServeAI', inbound messages (direction:'inbound') as dark bubbles on the left. When a socket 'conversation-update' event arrives, append the new message to the displayed conversation. Show a typing indicator (3 animated dots) when status is 'booking' and no new message has arrived in the last 3 seconds."

🤖 **AI creates the Human-in-the-Loop prompt component**

Tell AI:
> "Create src/components/UserInputPrompt.jsx. Shown inside BookingFeed when the latest conversation update has requiresUserInput:true. Show a card with a teal left border, a message 'The provider is asking:', the provider's question in bold, a text input, and a 'Send Reply' button. On submit, POST to VITE_BACKEND_URL/api/requests/:requestId/reply with the user's text and Firebase auth header."

🤖 **AI creates the /reply endpoint**

Tell AI:
> "Create POST /api/requests/:requestId/reply. Verify Firebase token. Accept userReply text in body. Retrieve the request and its conversation history from MongoDB. Call a new Gemini function processProviderReply(latestProviderMessage, userReply, conversationHistory, requestId) that composes a professional WhatsApp reply incorporating the user's answer. Prefix the message with [requestId]. Call sendWhatsAppMessage. Append both the user input and the outbound AI message to the conversation array in MongoDB. Emit 'conversation-update' via Socket.io."

**Day 8 is done when:** You can see a real-time WhatsApp conversation feed in the browser while a live conversation happens on a phone.

---

## DAY 9 — JUNE 6 (FRIDAY)
### Goal: Confirmation receipt generated and displayed

**Time needed: 3–4 hours**

🤖 **AI creates receipt generation**

Tell AI:
> "Add a function detectBookingConfirmation(conversationHistory) to geminiAgent.js. Send the conversation history to Gemini and ask it: 'Has this booking been confirmed? Look for the provider agreeing to a specific time and location. Return JSON: { confirmed: true/false, scheduledTime: string or null, notes: string or null }'. 
>
> Call this function after every inbound provider message in the webhook handler. If confirmed is true, update the request status to 'confirmed', generate a receipt object with: requestId, providerName, serviceType, scheduledTime, userArea, bookedAt timestamp, and save it to the request document. Emit a 'booking-confirmed' socket event with the receipt."

🤖 **AI creates the Receipt screen**

Tell AI:
> "Create src/components/ReceiptScreen.jsx. Shown when BookingFeed receives a 'booking-confirmed' socket event. Animate a green checkmark SVG drawing itself. Show 'Booking Confirmed!' in 24px teal. Show a receipt card with dark background and 3px teal top border showing: Service type, Provider name, Scheduled time, Location, Request ID in monospace. Show a 'Back to Home' teal button and a 'View History' ghost button."

**Day 9 is done when:** When a provider sends a confirming reply, the user's browser automatically shows the receipt screen.

---

## DAY 10 — JUNE 7 (SATURDAY)
### Goal: Request history sidebar, polish, and the complete UI looking premium

**Time needed: 5 hours**

🤖 **AI creates the history screen**

Tell AI:
> "Create src/components/HistoryScreen.jsx. Show a list of past requests from GET /api/requests/history. Each row shows the service type, provider name, status badge (Active=teal, Confirmed=grey, Cancelled=red), and date. Tapping a row navigates to the BookingFeed for that request showing the full past conversation."

🤖 **AI applies the full design system**

Tell AI:
> "Apply a consistent design system across all components using CSS variables. Root variables to define: --bg-primary: #0F1117, --bg-surface: #1A1D27, --bg-elevated: #252836, --brand: #00C896, --text-primary: #F0F4F8, --text-secondary: #8B95A5, --error: #EF4444. Import 'Plus Jakarta Sans' and 'Inter' from Google Fonts. Apply Inter as the default font globally. Use Plus Jakarta Sans for all headings. Check every screen and ensure colors match the design system. Add 250ms ease-out horizontal slide transitions between screens. Add scale(0.97) press animation to all buttons."

👤 **You review every screen on mobile width**
- Open Chrome DevTools → device toggle → set to 390px width
- Go through every screen manually and note anything that looks wrong
- Paste your observations to AI and ask it to fix each one

**Day 10 is done when:** Every screen looks polished, consistent, and professional at 390px width.

---

## DAY 11 — JUNE 8 (SUNDAY)
### Goal: All edge cases handled, no crashes possible

**Time needed: 4 hours**

🤖 **AI adds error handling to every screen**

Tell AI:
> "Go through every API call in the frontend and add proper error handling. Every API call needs: a loading state (disable button, show spinner), a success state, and an error state (show a friendly toast message, never show a raw error). Specific messages to show: if Maps returns no results show 'No providers found nearby — try increasing your search radius in settings', if the Twilio message fails show 'Couldn't reach this provider on WhatsApp — try another option', if any network request fails show 'Something went wrong. Please try again.'"

🤝 **Test the multi-user same-provider scenario**
- Open two browser tabs, log in as two different Google accounts
- Have both request the same service type (e.g., "I need a plumber")
- Both should get results, both should be able to book independently
- If a provider replies, verify the reply routes to the correct user's feed
- If anything breaks, paste the bug to AI to fix

**Day 11 is done when:** You cannot make the app crash by doing anything a real user might do.

---

## DAY 12 — JUNE 9 (MONDAY)
### Goal: Live on the internet with a permanent public URL

**Time needed: 3–4 hours**

🤖 **AI creates the Dockerfile for Cloud Run**

Tell AI:
> "Create a Dockerfile in the backend folder: FROM node:20-alpine, WORKDIR /app, COPY package*.json ./, RUN npm ci --only=production, COPY . ., EXPOSE 8080, CMD node index.js. Also create a .dockerignore file that excludes node_modules and .env."

👤 **You deploy the backend to Cloud Run**

Run in terminal (replace placeholders):
```
gcloud run deploy [appname]-backend --source ./backend --region us-central1 --allow-unauthenticated --set-env-vars MONGODB_URI=[your-uri],GOOGLE_MAPS_API_KEY=[your-key],TWILIO_ACCOUNT_SID=[sid],TWILIO_AUTH_TOKEN=[token],TWILIO_WHATSAPP_FROM=[number],FIREBASE_PROJECT_ID=[id],FIREBASE_CLIENT_EMAIL=[email],VERTEX_AI_LOCATION=us-central1
```

For FIREBASE_PRIVATE_KEY — paste it separately in the Cloud Run console under Edit → Variables because it contains special characters that break command line.

Copy the Cloud Run URL it gives you (format: https://appname-backend-xxxx.run.app). Update VITE_BACKEND_URL in your frontend .env to this URL.

👤 **You deploy the frontend to Firebase Hosting**

Run in frontend folder:
```
npm run build
npx firebase login
npx firebase init hosting   (select your Firebase project, dist as public dir, SPA: yes)
npx firebase deploy
```

Firebase gives you a permanent URL like https://your-project-id.web.app

👤 **Update Twilio webhook URL**
- Now that you have a permanent Cloud Run URL, update Twilio Sandbox webhook from the ngrok URL to: https://[your-cloud-run-url]/webhook/twilio/whatsapp

**Day 12 is done when:** Your app is live at a public Firebase URL and the full demo script works on the live deployment.

---

## DAY 13 — JUNE 10 (TUESDAY)
### Goal: Submit. Everything done. Win.

**Time needed: 5–6 hours**

👤 **Run the demo script 3 times on the live app**
- Use the exact script from File 1
- Time each run — aim for under 90 seconds from login to receipt
- Note any hesitation or rough moment

👤 **Record the demo video (3 minutes maximum)**
- Use OBS Studio (free) for screen recording
- Structure: 30 sec problem → 2 min live demo → 30 sec tech stack + what's next
- Say "Lahore" or "Karachi" on screen — real city, real problem, real market
- Record minimum 3 takes, use the best one
- Upload to YouTube as Unlisted, copy the link

👤 **Check GitHub repo**
- Repository is public: ✓
- LICENSE file at root level (MIT license): ✓
- .env is NOT committed (check carefully): ✓
- README.md with brief project description: ✓

🤖 **AI writes your README.md**

Tell AI:
> "Write a professional GitHub README.md for [app name]. Include: project tagline, a 3-sentence description of what it does, a Features section listing the main capabilities, a Tech Stack section listing Gemini 2.0 Flash, Google Cloud Vertex AI, Google Maps Places API, MongoDB Atlas, Node.js, React, Twilio WhatsApp, Firebase Authentication, Google Cloud Run, and a Getting Started section with environment variable setup instructions."

👤 **Write your Devpost submission (400–600 words)**

Write these five sections in your own words:
1. The problem — make it personal and specific to Pakistan or your market
2. What ServeAI does — follow the demo script
3. How we built it — name every technology, especially Gemini, Vertex AI, Cloud Run, MongoDB Atlas
4. The challenge we overcame — mention the multi-user WhatsApp routing problem and how you solved it with Request IDs
5. What's next — the startup vision, the Pakistani market, the global WhatsApp opportunity

👤 **Submit on Devpost**
- App name, tagline, YouTube link, GitHub link, tech tags, written description
- Click Submit before 11:59 PM on June 10

---

## DAILY ROUTINE (Follow Every Day Without Exception)

**Session start (5 minutes):**
Open PROGRESS.md. Read what was working yesterday. Start your AI session by pasting PROGRESS.md and saying: "This is my current progress. Today's goal is [today's goal from this plan]. Help me achieve it."

**During the session:**
Test every feature immediately after building it. Never write more than 30 minutes of code without running it once.

**Session end (5 minutes):**
Update PROGRESS.md with: ✅ What's working | ❌ What's still broken | ➡️ Next step tomorrow. Commit to GitHub: `git add . && git commit -m "Day X: [what you built]" && git push`

**Non-negotiables:**
- Sleep. Do not code past 1am. Exhaustion broke the last submission.
- Close all browser tabs except what you need right now.
- Restart laptop every morning before the session.

---

## THE 13-DAY SUMMARY

| Day | Date | Goal |
|-----|------|------|
| 1 | May 29 | Accounts + laptop + Hello World server live |
| 2 | May 30 | Google Sign-In → MongoDB user created |
| 3 | May 31 | Profile setup screen → preferences saved |
| 4 | June 1 | Google Maps finds real nearby businesses |
| 5 | June 2 | Gemini understands request + writes explanations |
| 6 | June 3 | Full request flow works in browser end-to-end |
| 7 | June 4 | WhatsApp message sends to provider |
| 8 | June 5 | Live booking feed + human-in-the-loop prompt |
| 9 | June 6 | Confirmation receipt generated automatically |
| 10 | June 7 | History screen + full UI polish |
| 11 | June 8 | Edge cases + multi-user testing |
| 12 | June 9 | Live deployment on Cloud Run + Firebase |
| 13 | June 10 | Demo video + Devpost submission ✅ |

---

*Updated May 28, 2026. Previous plan still valid for architecture reference — this file supersedes it for scheduling only.*
*13 days. One screen per day. You've built more complex things than this before. Go.*
