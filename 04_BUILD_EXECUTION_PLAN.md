# ServeAI — Build Execution Plan
### File 4 of 4 | Day-by-day plan, AI tools strategy, problems and solutions

---

## How to Read This Document

This document is your daily operating manual. Before you write a single line of code each day, read the section for that day. It tells you exactly what to build, what could go wrong, and how to fix it if it does. It also tells you which AI tool to use for which kind of problem so you never waste your limited token budget on the wrong model.

When you paste these four files into an AI coding assistant for the first time, say this: "Read all four ServeAI files carefully. File 1 is the product vision, File 2 is the technical architecture, File 3 is the UI/UX design spec, and this file is the build plan. Once you have read them all, tell me you are ready and wait for my first instruction."

---

## Laptop Preparation (Do This Before Day 1 — Takes 2 Hours)

Your 4GB RAM laptop froze during the last hackathon. The cause was almost certainly a combination of too many background processes, leftover node_modules directories from old projects, and Chrome tabs consuming memory. Fixing this now saves hours of frustration during the build.

Open Task Manager (Ctrl+Shift+Esc), go to the Startup tab, and disable every program that is not Windows Defender or your audio driver. Spotify, Discord, Teams, OneDrive sync, Steam, any printer or manufacturer software — all disabled. These programs consume between 50MB and 300MB each at startup and never give it back.

In your browser, go through your installed extensions and remove any you do not actively use. Ad blockers and password managers are fine, but anything related to shopping, coupons, or social media should go. Each extension is a small memory leak.

Delete the node_modules folders from all previous projects. They can be hundreds of megabytes or even gigabytes each, and deleting them does not break anything — you can always run `npm install` in an old project to restore them. Open File Explorer, navigate to wherever you keep your projects, and delete any node_modules folder you find.

Use Edge browser instead of Chrome for the duration of this build. Edge uses the same rendering engine as Chrome but with significantly lower memory consumption — typically 20–30% less RAM. Open only the tabs you need right now. Close everything else.

Restart your laptop fresh at the beginning of each coding session rather than waking it from sleep. A machine that has been sleeping for two days with seventeen programs open is not the same as a freshly started machine.

During coding sessions, keep only two windows open: your code editor and your browser pointed at one or two reference tabs. Close the browser entirely when you are writing backend code that doesn't need visual reference. The difference in editor responsiveness is noticeable.

---

## AI Tools Strategy — Which Tool for What

You have access to several AI tools across different contexts. Using the right tool for the right kind of problem is the difference between your tokens lasting 19 days and running out in 4.

**This chat (Claude Sonnet on claude.ai)** is your planning and problem-solving tool. Use it when you are confused about architecture, when you need to think through a design decision, when you hit a bug you cannot understand, or when you need to write a complex prompt for Gemini. It is the right tool for thinking, not for typing. Do not use it to write entire files from scratch — use it to understand the hard parts and then write the code yourself with Gemini's help. This preserves your daily message limit for moments that actually need deep reasoning.

**GitHub Copilot free tier (inside VS Code)** is your daily autocomplete and code completion tool. Install the GitHub Copilot extension in VS Code. The free tier gives you 50 chat messages and 2,000 code completions per month. Use the completions for boilerplate, function signatures, and straightforward code patterns. Use the chat messages for quick questions like "how do I parse a JSON body in Express" or "write a Mongoose schema for this object." These are low-value questions that do not need Claude's reasoning power.

**Gemini Code Assist (VS Code extension)** is your backup when GitHub Copilot chat messages run out. It is free with unlimited use through your Google account. The code quality is lower than Claude for complex reasoning but perfectly adequate for writing standard code patterns. It is also useful when working directly with Gemini API code and Vertex AI configuration since it has native knowledge of those services.

**Antigravity / other Claude interfaces** with your rotating accounts are best saved for intensive multi-hour agentic coding sessions — those rare moments where you have a complex multi-file problem and need an AI to navigate your entire codebase, run commands, and fix things across multiple files simultaneously. Do not use these accounts for casual questions. Save them for when you are genuinely stuck on something architectural.

**The PROGRESS.md pattern** is the most important habit of the entire build. Create a file called PROGRESS.md in the root of your project. At the end of every coding session, update it with three things: what is working right now (be specific — "Google Sign-In works, user document gets created in MongoDB"), what is not working yet ("WhatsApp webhook is not receiving Twilio callbacks"), and what is the next thing to do ("Set up ngrok tunnel to test Twilio webhook locally"). When you start a new session with any AI coding assistant, paste the contents of PROGRESS.md as the first message. This means you never spend tokens re-explaining your project state. It also means that if you have to switch AI tools mid-session, the new tool is immediately up to speed.

---

## Environment Setup (Day 1 — May 23)

Day 1 is entirely account creation and environment configuration. No feature code is written today. The goal is: by the end of the day, you have a Node.js server responding to HTTP requests on the internet, and you can connect to your MongoDB database from that server.

Start by creating the business Gmail account: serveai.app@gmail.com. Use this email for every account from this point forward.

Go to console.firebase.google.com and create a new project named "serveai". In the project, go to Authentication, click Get Started, and enable the Google sign-in provider. While here, add a web app to the project and copy the Firebase configuration object — you will need those values for your frontend .env file. Go to Project Settings, then Service Accounts, and generate a new private key — download the JSON file. This file contains your FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID values for the backend .env.

Go to cloud.mongodb.com and create a free M0 cluster named "serveai-cluster". Create a database user with a username and strong password. Whitelist 0.0.0.0/0 as an allowed IP address (this is fine for development; you can restrict it later for production). Copy your MongoDB connection string and store it — it looks like: `mongodb+srv://username:password@serveai-cluster.xxxxx.mongodb.net/serveai`.

Go to console.cloud.google.com and create a new project named "serveai". Activate your $100 free credits if you have not already. Enable these four APIs by searching for them in the API Library: Vertex AI API, Maps Places API (New), Cloud Run API, and Cloud Build API.

Go to twilio.com and create a free account. In the Twilio console, navigate to Messaging, then Try it Out, then Send a WhatsApp Message. Follow the instructions to connect your own WhatsApp number to the Twilio Sandbox. Note the Sandbox number (format: whatsapp:+14155238886) and your Account SID and Auth Token.

Now create your project structure locally. Open VS Code in an empty folder called `serveai`. Create two subfolders: `backend` and `frontend`. In the `backend` folder, run `npm init -y`, then install your initial dependencies: `npm install express mongoose firebase-admin @google-cloud/vertexai @googlemaps/google-maps-services-js twilio socket.io cors dotenv`. Create an `index.js` file and write a minimal Express server that listens on port 8080 and responds to GET / with "ServeAI Backend is running." Create your .env file with all the environment variables listed in File 2. Start the server with `node index.js` and confirm it works in your browser at localhost:8080. If you see your message, Day 1 is done.

---

## Authentication Implementation (Day 2 — May 24)

Today's single goal: when a user clicks "Sign in with Google" in the frontend, they end up as a document in your MongoDB users collection. Nothing more.

In the `frontend` folder, create a new Vite React project: `npm create vite@latest . -- --template react`. Install Firebase: `npm install firebase`. Create `src/firebase.js` and initialize Firebase with your config values from the .env file. Create the Google Auth provider with `new GoogleAuthProvider()`. Export `auth` and `provider`.

Create `src/components/Login.jsx`. This is a single React component that renders the Google Sign-In button from the UI spec in File 3. The button's onClick handler calls `signInWithPopup(auth, provider)`. In the `.then()` callback, get the Firebase ID token with `result.user.getIdToken()`, then POST it to your backend's `/api/auth/verify` endpoint with the token in the Authorization header.

In the backend, create `routes/auth.js`. The `/api/auth/verify` POST endpoint receives the token, calls `admin.auth().verifyIdToken(token)` using the Firebase Admin SDK, extracts the `uid`, `email`, and `name` from the decoded token, then calls `User.findOneAndUpdate({ firebaseUid: uid }, { email, name, firebaseUid: uid }, { upsert: true, new: true })` on your MongoDB User model. It returns the user document as JSON.

The most common problem on this day is a CORS error — the browser refuses to let the frontend (running on localhost:5173) make requests to the backend (running on localhost:8080) because they are on different ports. Fix this by adding `app.use(cors({ origin: process.env.FRONTEND_URL }))` to your backend, where FRONTEND_URL in development is `http://localhost:5173`. If you are still getting CORS errors, temporarily use `app.use(cors())` with no options — this allows all origins and is fine for development.

The second common problem is the Firebase Admin SDK failing to initialize because the private key has escaped newlines. The private key in your .env file must have literal `\n` characters (not actual newlines), and when you pass it to the Admin SDK you must replace them: `privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')`.

By the end of Day 2, you should be able to click Sign In in your browser, complete the Google OAuth flow, and then see a new document appear in your MongoDB Atlas collection. This is your most important early milestone.

---

## Profile Setup and User Preferences (Day 3 — May 25)

Today you build the profile setup screen and connect it to MongoDB. The goal: after sign-in, first-time users see the profile setup form, fill it in, and have their preferences stored in their user document.

Build the Profile Setup component following the two-step design in File 3. Step 1 collects name, phone, and area. Step 2 collects radius preference, price range, and minimum rating. The "Next" button on Step 1 validates that the name is at least 2 characters and the phone field matches the Pakistani number format regex: `/^(\+92|0)?3[0-9]{9}$/`. Store the Step 1 data in React state when Next is pressed (do not send to backend yet). When "Save and Continue" on Step 2 is pressed, combine both steps' data and send a PUT to `/api/user/profile` with the complete profile data.

In the backend, the `/api/user/profile` PUT endpoint verifies the Firebase token as described in Day 2, extracts the Firebase UID, finds the user document, and updates it with the submitted fields.

After saving, navigate the user to the main screen. In the main App component, use Firebase's `onAuthStateChanged` to listen for auth state changes. When a user is authenticated, fetch their profile from `/api/user/profile`. If the profile has a phone number, render the main screen. If not, render the profile setup screen. This creates the correct routing logic automatically.

---

## Google Maps Integration (Day 4 — May 26)

Today you build the service that finds nearby providers. The goal: given a user's request text, location, and preferences, your backend returns a list of real businesses from Google Maps.

Create `services/mapsService.js` in your backend. Install the Google Maps client: it is already installed from Day 1. The service exports a single async function: `searchNearbyProviders(query, lat, lng, radiusMeters, minRating)`. Inside, call the Google Maps Places API Text Search endpoint. The query should be the extracted service type combined with the city name (e.g., "plumber Lahore"). The location parameter is the user's lat/lng. The radius is converted from km to meters (multiply by 1000). From the results, filter out any businesses with a rating below minRating, sort by rating descending, and return the top 5 results with their name, rating, distance from the user's location (calculated with the Haversine formula), address, and phone number if available.

The Haversine formula for calculating distance between two lat/lng points in JavaScript:

```javascript
// Calculates the straight-line distance in kilometers between two coordinates
// This is good enough for nearby search results — exact road distance is not needed
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
```

Test this service by writing a temporary test route: `GET /test/maps?query=plumber&lat=31.4697&lng=74.4089`. Call it from your browser and confirm you get real business results back. If you see real Lahore plumbers in the response, the Maps integration is complete.

---

## Gemini AI Agent (Days 5–6 — May 27–28)

These two days are the most complex of the entire build. The Gemini agent is responsible for understanding the user's request, calling the Maps service, selecting the best providers, writing explanations, and managing the WhatsApp conversation. Do not rush this. Get it working correctly rather than quickly.

Create `services/geminiAgent.js`. Initialize the Vertex AI client with your project ID and location. Create the Gemini Flash model. Define two tools: `searchProviders` (which calls your Maps service internally) and `composeWhatsAppMessage` (which formats a professional WhatsApp message with the Request ID prefix).

The system prompt for the agent is defined in File 2. Paste it exactly. Do not shorten it or paraphrase it — the specific instructions about Request IDs, privacy, and when to ask for user input are all load-bearing.

The agent function `processServiceRequest(userRequestText, userPreferences, requestId)` works as follows. It sends the user's request text to Gemini along with a context message: "User preferences: radius ${radiusKm}km, price range: ${priceRange}, minimum rating: ${minRating}. User is located in ${userArea} at coordinates ${lat}, ${lng}." It allows Gemini to make tool calls. When Gemini calls `searchProviders`, execute the Maps service function and return the results to Gemini. Gemini then selects the top 3, writes explanations for each, and returns a structured response.

The most common problem here is the tool calling format. Gemini's Vertex AI tool calling API has a specific JSON schema format that is different from OpenAI's function calling format. Follow the Vertex AI documentation exactly. If Gemini is returning text instead of making tool calls, the tool definitions are likely malformed. Paste them to this chat and ask for help debugging.

The second function in the agent is `processProviderReply(incomingMessage, conversationHistory, requestId)`. This function is called every time the Twilio webhook receives a provider's WhatsApp reply. It sends the full conversation history plus the new message to Gemini and asks it to decide: should it reply automatically, or does this message require user input? If Gemini determines user input is needed, the function returns `{ requiresUserInput: true, userPrompt: "The provider is asking: [question]" }`. If Gemini can reply automatically (the provider confirmed availability and the user's preferences already capture the details needed), it returns `{ requiresUserInput: false, reply: "[composed message]" }`.

---

## WhatsApp Integration (Days 7–8 — May 29–30)

Today you connect your backend to Twilio's WhatsApp Sandbox and implement the full messaging flow.

Create `services/whatsappService.js`. Initialize the Twilio client with your Account SID and Auth Token. The service exports two functions. `sendMessage(toNumber, messageBody)` calls `client.messages.create({ from: TWILIO_WHATSAPP_FROM, to: 'whatsapp:' + toNumber, body: messageBody })`. `validateIncomingWebhook(req)` uses Twilio's request validation to confirm that incoming webhook calls are genuinely from Twilio and not from someone else trying to inject fake messages.

Create the Twilio webhook endpoint: `POST /webhook/twilio/whatsapp`. This endpoint has no Firebase auth check (Twilio cannot provide Firebase tokens). Instead, validate the Twilio signature using `twilio.validateRequest(authToken, signature, url, params)`. If validation fails, return 403. If validation passes, extract the message body and the sender's phone number from the Twilio request body. Extract the Request ID from the message body using the regex from File 2. Look up the request in MongoDB. Call the Gemini agent's `processProviderReply` function. If it requires user input, update the request document with `requiresUserInput: true` and the prompt, then emit a Socket.io event to the user's room. If it does not require user input, call `sendMessage` with the AI's composed reply and append both messages to the conversation array in MongoDB.

The most important local testing problem: Twilio needs a publicly accessible HTTPS URL to send webhooks to. Your laptop running localhost is not publicly accessible. The solution is **ngrok**. Install ngrok (free tier), run `ngrok http 8080`, and it gives you a public HTTPS URL like `https://abc123.ngrok.io`. Go to the Twilio Sandbox settings and set the "When a message comes in" webhook URL to `https://abc123.ngrok.io/webhook/twilio/whatsapp`. Now Twilio can reach your local development server. Note: your ngrok URL changes every time you restart ngrok on the free tier, so you need to update the Twilio settings each development session. This is a development-only problem — in production your Cloud Run URL is permanent.

---

## Frontend Chat Interface (Days 9–11 — May 31–June 2)

These three days build the actual user-facing app following the UI spec in File 3. The goal is to connect all the backend pieces you have built into a beautiful, functional interface.

Start with the global CSS file. Set up all the design tokens from File 3 as CSS variables at the `:root` level. Import Plus Jakarta Sans and Inter from Google Fonts. Set `box-sizing: border-box` and `margin: 0; padding: 0` globally. This foundation ensures every component you build from this point forward is visually consistent.

Build the screens in this order because each one depends on the previous: Login Screen, then Profile Setup Screen, then Main Home Screen with the input bar, then the Provider Results display, then the Live Booking Feed, then the Receipt Screen. Do not jump ahead to a later screen until the previous one is working end-to-end.

For real-time updates in the booking feed, install Socket.io client in the frontend: `npm install socket.io-client`. In the Booking Feed component, connect to your backend Socket.io server and join the room named after the request ID: `socket.emit('join-request', requestId)`. Listen for `conversation-update` events: `socket.on('conversation-update', (data) => { setMessages(prev => [...prev, data]) })`. In the backend, when a new WhatsApp message arrives, emit `io.to(requestId).emit('conversation-update', messageData)`.

The human-in-the-loop prompt component is the most important UI element in the app. When the booking feed receives an update where `requiresUserInput` is true, render the prompt card described in File 3. When the user submits their response, POST it to `/api/requests/:requestId/reply`, which triggers the Gemini agent to compose and send the WhatsApp message with the user's input.

---

## Polish, Error Handling, and Edge Cases (Days 12–14 — June 3–5)

Day 12 is entirely about making the app not crash. Go through every screen and ask: what happens if the network is slow? What if the API call fails? What if the user has no internet? Every API call in the frontend needs a loading state and an error state. The loading state prevents double-taps and shows the user something is happening. The error state shows a friendly message and offers a retry option.

Day 13 is about the Request ID multi-user system. Test it by opening two browser windows simultaneously, logging in as different users (you may need a second Google account), and having both request the same service type. Verify that both conversations stay separate, both users see only their own booking feed, and a provider reply routes to the correct user's feed. This test must pass before the demo.

Day 14 is mobile responsiveness. Open Chrome DevTools (F12), click the device toggle icon, and test the app at 390px width (iPhone 14). Check that text is readable, buttons are tappable (minimum 44px touch target), the input bar is not hidden behind the keyboard, and no content is cut off horizontally. Fix any layout issues using the responsive CSS rules from File 3.

---

## Demo Preparation (Days 15–16 — June 6–7)

Day 15 is a complete end-to-end dress rehearsal. Deploy the latest backend to Cloud Run and the latest frontend to Firebase Hosting. Run the exact demo script from File 1 three times on the live deployed app (not localhost). Time it — the whole flow from opening the app to seeing the receipt should take under 90 seconds. Note every moment that feels slow, broken, or confusing. Fix those issues.

Day 16 is recording the demo video. 3 minutes maximum. Structure: 30 seconds on the problem (speak naturally — "if you live in Pakistan you know how frustrating it is to find a trusted plumber at 10pm"), 2 minutes showing the exact demo script live on screen with your voice explaining what is happening, 30 seconds on what you built it with (Gemini, Google Cloud, MongoDB Atlas — name the hackathon partners explicitly). Record in a quiet room. Use screen recording software (OBS Studio is free). Do the full recording at least three times and use the best take. Upload to YouTube as an unlisted video.

---

## Submission Checklist (Days 17–18 — June 8–9)

Work through this list and confirm each item before submission. Do not leave this for the last day.

Confirm that your GitHub repository is public and contains a LICENSE file (use the MIT license — it is the simplest open-source license to add). The LICENSE file must be visible at the root of the repository, not inside a subfolder. Confirm that your .env file is listed in .gitignore and is not committed to the repository. If it was ever committed by accident, rotate all your API keys immediately — anyone can see old commits.

Confirm that your app is live and accessible at a public URL without any login required to see the landing page. Judges may tap the link before the demo video.

Write your Devpost submission. The description should cover: what problem ServeAI solves, who it is for, how it works (the demo script in accessible language), what technologies were used (be explicit about Gemini, Vertex AI, Google Cloud Run, MongoDB Atlas — these are what the judges are scoring for), what you learned, and what is next for the project as a startup. This description should be 400–600 words. It matters more than most people assume.

Submit on June 10 — one day before the deadline. If your internet fails or your laptop crashes on June 11, you have already submitted.

---

## Common Problems and Their Solutions

This section documents every problem likely to be encountered during this build, with the exact solution for each.

If Firebase Sign-In shows "auth/popup-blocked", the browser has blocked the popup. This is common in some browsers when the sign-in is triggered by something other than a direct user click. Ensure the `signInWithPopup` call is in the button's onClick handler directly, not inside a useEffect or a setTimeout. The call must be synchronous from a user interaction event.

If the Maps API returns "REQUEST_DENIED", the API key is either not enabled for the Places API or has IP restrictions set. Go to Google Cloud Console, find your API key, and ensure it has no application restrictions for development. Enable the "Places API (New)" — not the legacy "Places API" which is being deprecated.

If the Gemini agent returns a response but never calls the tools, the tool definitions have a schema error. The Vertex AI tool calling format requires each parameter to have a `type` field and parameters must be inside a `properties` object within a `parameters` object with `type: "object"`. If you are unsure of the exact format, paste your tool definition to this chat and ask for it to be validated.

If Socket.io connections are not working on Cloud Run, enable WebSocket support in the Cloud Run service settings. Go to Cloud Run, select your service, click Edit, and under the "Connections" tab, enable the "HTTP/2 end-to-end" option which enables WebSocket support.

If MongoDB Atlas connections time out after a few minutes of inactivity, add `serverSelectionTimeoutMS: 5000` and `socketTimeoutMS: 45000` to your Mongoose connect options, and implement a connection retry function that re-establishes the connection if it drops.

If the Twilio webhook validation fails, ensure you are passing the exact URL including the protocol and path as it appears in the Twilio console, not a modified version. The validation is sensitive to URL format.

---

## Daily Routine Template

Every day begins by reading this template and following it.

Start each session by running your backend and frontend locally to confirm everything that was working yesterday is still working. Never skip this check — it takes 2 minutes and prevents the devastating situation of discovering at the end of the day that something broke and you do not know when.

Before writing any new code, update PROGRESS.md with what is working and what your goal is for today. Paste the file to your AI coding assistant as the first message of the session.

Write code in small, testable increments. After every new function, test it before moving to the next one. The pattern that causes hackathon failures is writing 3 hours of untested code and then spending 6 hours debugging something that could have been caught in 10 minutes if each piece had been tested individually.

Commit to GitHub at the end of every session, even if the work is incomplete. The commit message should be honest: "Add Maps service, not connected to Gemini yet." This creates a safety net and a history that is useful for the Devpost submission.

End each session by updating PROGRESS.md with what is now working and what is left to do tomorrow. Close everything, restart your laptop, and get adequate sleep. Decisions made while exhausted at 3am caused the last submission to fail. Shipping a slightly less complete project while rested is better than shipping nothing because exhaustion broke your judgment.

---

*This document is version 1.0, created May 23, 2026.*
*Deadline: June 10 for submission (one day before the official June 11 deadline).*
*You can do this. The plan is clear, the tools are ready, and the idea is real.*
