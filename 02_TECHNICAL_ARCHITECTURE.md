# ServeAI — Complete Technical Architecture
### File 2 of 4 | The engineering blueprint for every technical decision

---

## How to Read This Document

This document describes every technical component of the ServeAI system — what it is, why it was chosen, how it connects to everything else, and exactly how to implement it. When you are writing code and need to understand how a piece fits into the larger system, this document answers that. Read File 1 first to understand what we are building before reading this file about how we are building it.

---

## System Architecture Overview

ServeAI is built as a three-tier web application. Understanding the three tiers and what lives in each one is the foundation for all technical decisions.

The first tier is the **Frontend** — this is the React application that runs in the user's browser. It is responsible for displaying the UI, capturing user input, managing authentication state, and showing real-time updates from the booking process. It communicates with the backend exclusively through HTTP API calls and WebSocket connections. It knows nothing about databases, AI models, or WhatsApp — all of that complexity lives in the backend.

The second tier is the **Backend** — this is a Node.js Express server deployed on Google Cloud Run. It is the brain of the system. It receives requests from the frontend, orchestrates the Gemini AI agent, calls the Google Maps Places API, sends and receives WhatsApp messages through Twilio, reads and writes data to MongoDB, and manages authentication verification. It never exposes database credentials or API keys to the frontend.

The third tier is the **Data Layer** — this is MongoDB Atlas, the database that stores all persistent data. It stores user profiles, service requests, booking conversations, and provider information. The backend is the only component that communicates directly with the database.

Supporting services sit alongside these three tiers: Firebase handles authentication tokens, Google Maps provides location-based business discovery, Twilio handles WhatsApp messaging, and Google Cloud Vertex AI hosts the Gemini model.

```
USER BROWSER
     |
     | HTTPS
     v
REACT FRONTEND (Firebase Hosting)
     |
     | REST API + WebSocket
     v
NODE.JS BACKEND (Google Cloud Run)
     |
     |--- Vertex AI (Gemini 2.0 Flash)
     |--- Google Maps Places API
     |--- Twilio WhatsApp Sandbox
     |--- MongoDB Atlas
     |--- Firebase Admin SDK (token verification)
```

---

## Technology Stack — Every Tool and Why

**Frontend: React 18 with Vite**
React is used because it is the most widely supported frontend framework with the largest ecosystem of components. Vite is used as the build tool because it starts up and reloads far faster than Create React App on a low-resource laptop — this matters enormously during development on a 4GB RAM machine. Tailwind CSS is used for styling because it generates minimal CSS at build time and requires no context-switching between style files and component files. The frontend is hosted on Firebase Hosting which provides a free public HTTPS URL — the exact kind of hosted URL required by the hackathon submission.

**Authentication: Firebase Authentication**
Firebase Authentication is used specifically because it wraps Google's OAuth2 flow into five lines of code. The alternative — implementing Google OAuth2 from scratch — requires handling redirect URIs, PKCE flow, callback endpoints, token refresh, and CORS configuration. This was the source of the two-day blockage in the previous hackathon attempt. Firebase Authentication eliminates all of this complexity. The frontend calls `signInWithPopup(googleProvider)` and receives a user object. The backend verifies the Firebase ID token using the Firebase Admin SDK. This is the entire authentication system.

**Backend: Node.js with Express**
Node.js is chosen because it handles concurrent asynchronous operations extremely efficiently — this matters for ServeAI because the backend needs to simultaneously maintain WebSocket connections for real-time updates, poll Twilio for incoming WhatsApp replies, and make API calls to Gemini and Maps. Express is the minimal, unopinionated framework that adds routing and middleware without imposing structure. The backend is deployed on Google Cloud Run in a Docker container, which means it scales from zero instances (when no one is using the app) to multiple instances (under load) automatically.

**Database: MongoDB Atlas**
MongoDB is required for the hackathon's MongoDB track, but it is also genuinely the right choice for this specific application. The data ServeAI manages — user profiles, service requests, WhatsApp conversation histories — is hierarchical and variable in structure. A single booking request might contain 3 WhatsApp messages or 30, might have a receipt attached or not, might have location data or not. MongoDB's document model stores all of this as a single nested document without requiring complex relational joins. The free M0 tier on MongoDB Atlas provides 512MB of storage — more than sufficient for a hackathon demo and the first few hundred users.

**AI Model: Gemini 2.0 Flash via Google Cloud Vertex AI**
Gemini Flash is chosen over Gemini Pro or Gemini Ultra for three specific reasons. It is significantly faster in response time — the demo needs the AI to respond within 2–3 seconds, not 10–15. It is dramatically cheaper — on the $100 Google Cloud credits, Gemini Flash costs approximately $0.075 per million tokens, meaning the credits cover tens of thousands of requests. It is required by the hackathon to be accessed via Google Cloud Vertex AI specifically, not the standalone Gemini API. The Vertex AI access method also enables the MongoDB MCP server integration which is a required element of the MongoDB track submission.

**WhatsApp Messaging: Twilio WhatsApp Sandbox**
For the hackathon, the Twilio Sandbox is used. The Sandbox provides a real WhatsApp Business API environment without requiring Meta business verification. Any phone number that sends the join code to the Sandbox number becomes able to send and receive messages through it. This is sufficient for the demo. The backend communicates with Twilio through their Node.js SDK. Incoming messages from providers are received via a Twilio webhook that calls an endpoint on the backend. Full migration to the real WhatsApp Business API is a post-hackathon task.

**Location Data: Google Maps Places API (New)**
The new Google Maps Places API (as opposed to the deprecated legacy API) is used to search for businesses by category near a given location. It accepts a text query, a location (latitude/longitude), and a radius, and returns a list of matching businesses with names, ratings, addresses, phone numbers, and operating hours. The API key is stored in the backend environment variables and never exposed to the frontend.

**Real-time Updates: WebSocket via Socket.io**
The live booking feed — where the user watches the WhatsApp conversation happening in real time — requires real-time communication from backend to frontend. Socket.io provides WebSocket connections with automatic fallback to long-polling for environments where WebSocket is blocked. When the backend receives a new WhatsApp reply from a provider, it emits a Socket.io event to the specific user's room, and the frontend immediately displays the new message without any page refresh.

**Deployment: Google Cloud Run + Firebase Hosting**
The frontend is a static React build deployed to Firebase Hosting — free, globally distributed, HTTPS by default. The backend is deployed to Google Cloud Run as a Docker container — serverless, auto-scaling, and charged only for actual compute time. Both are required services within the Google Cloud ecosystem, which satisfies the hackathon's requirement to use Google Cloud infrastructure.

---

## Database Schema — Every Collection Explained

MongoDB stores data in collections, which are analogous to tables in a relational database but without a fixed schema. ServeAI uses four collections.

**Collection: users**
This collection stores one document per registered user. Every document contains the fields listed below. Understanding this schema helps when writing any code that touches user data.

```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated unique ID
  firebaseUid: "abc123xyz",         // The UID from Firebase Authentication
  email: "ayesha@gmail.com",        // From Google account
  name: "Ayesha Khan",              // From Google account, editable
  phone: "+923001234567",           // Entered during profile setup
  phoneVerified: false,             // True after OTP verification (V1 feature)
  createdAt: ISODate,
  
  preferences: {
    radiusKm: 5,                    // Max distance for provider search
    priceRange: "mid",              // "budget", "mid", "premium"
    minRating: 4.0,                 // Minimum star rating filter
    defaultArea: "DHA, Lahore",     // Default location label
    defaultLat: 31.4697,            // Default latitude
    defaultLng: 74.4089,            // Default longitude
  },
  
  privacySettings: {
    shareExactAddress: "always",    // "always", "ask", "never"
    sharePhoneWithProvider: "ask",  // "always", "ask", "never"
  }
}
```

**Collection: requests**
This is the central collection. Every service request a user makes creates one document here. The document grows as the booking progresses — messages are appended to the conversation array, the status field updates, and the receipt is embedded when the booking is confirmed.

```javascript
{
  _id: ObjectId,
  requestId: "REQ-00142",          // Human-readable ID shown in UI and sent in WhatsApp
  userId: ObjectId,                 // Reference to users collection
  userFirebaseUid: "abc123xyz",     // Duplicated for fast lookup without join
  
  status: "confirmed",             // "pending", "searching", "awaiting_user", 
                                    // "booking", "confirmed", "cancelled", "failed"
  
  originalRequest: "I need a plumber, something's leaking under my kitchen sink",
  
  searchParams: {
    query: "plumber",              // Extracted by Gemini from original request
    lat: 31.4697,
    lng: 74.4089,
    radiusKm: 5,
    priceRange: "mid",
    minRating: 4.0,
  },
  
  providers: [                     // Results from Google Maps Places API
    {
      placeId: "ChIJabc123",       // Google Maps unique place identifier
      name: "City Fix Services",
      phone: "+923211234567",
      rating: 4.4,
      distanceKm: 2.8,
      address: "32 Main Boulevard, Gulberg, Lahore",
      aiExplanation: "Available same-day, responds quickly on WhatsApp",
      selected: true,              // True for the provider the user chose
    },
    // ... more providers
  ],
  
  selectedProvider: {              // Copy of the chosen provider for easy access
    name: "City Fix Services",
    phone: "+923211234567",
    whatsappConversationId: "conv_REQ00142_cityfix",
  },
  
  conversation: [                  // The WhatsApp exchange, appended in real time
    {
      direction: "outbound",       // "outbound" = we sent, "inbound" = provider replied
      message: "[REQ-00142] Hello! A user near DHA Lahore needs plumbing service today.",
      timestamp: ISODate,
      sentBy: "ai",               // "ai" or "user" (when user manually guided)
    },
    {
      direction: "inbound",
      message: "Hi, what time works for you?",
      timestamp: ISODate,
      requiresUserInput: true,    // AI flagged this as needing user guidance
      userResponse: "3pm today",  // What the user typed in response
    },
    // ... more messages
  ],
  
  receipt: {                       // Generated after booking confirmed
    generatedAt: ISODate,
    providerName: "City Fix Services",
    serviceType: "plumbing",
    scheduledTime: "3:00 PM today",
    userArea: "DHA, Lahore",
    requestId: "REQ-00142",
  },
  
  createdAt: ISODate,
  updatedAt: ISODate,
}
```

**Collection: providers** (used in Startup V1 when providers self-register)
For the hackathon, providers are discovered dynamically through Google Maps and are not stored permanently. In V1, registered providers will have documents here.

**Collection: sessions** (optional, for analytics)
Lightweight documents tracking when users open the app and what they request, used for understanding product usage patterns. Not required for the hackathon.

---

## API Endpoints — Complete Backend Route Map

The backend exposes the following REST API endpoints. Every endpoint except the health check and the Twilio webhook requires a valid Firebase ID token in the Authorization header.

**Authentication Header format for all protected routes:**
`Authorization: Bearer <firebase_id_token>`

The backend verifies this token with Firebase Admin SDK on every request before processing anything.

**POST /api/auth/verify**
Called by the frontend immediately after Google Sign-In to verify the token and create or retrieve the user document in MongoDB. Returns the user object if the token is valid.

**GET /api/user/profile**
Returns the current user's profile from MongoDB including their preferences and privacy settings.

**PUT /api/user/profile**
Updates the user's profile. Used during onboarding and when the user edits their settings. Body contains only the fields being updated.

**POST /api/requests/new**
The most important endpoint. Accepts the user's natural language request text, retrieves their stored preferences, triggers the Gemini agent, calls Google Maps, and returns a list of provider options. This is where the core AI logic runs.

Request body:
```json
{
  "requestText": "I need a plumber, something's leaking under my kitchen sink",
  "lat": 31.4697,
  "lng": 74.4089
}
```

Response:
```json
{
  "requestId": "REQ-00142",
  "providers": [
    {
      "name": "City Fix Services",
      "rating": 4.4,
      "distanceKm": 2.8,
      "address": "32 Main Boulevard, Gulberg, Lahore",
      "aiExplanation": "Available same-day, responds quickly on WhatsApp"
    }
  ]
}
```

**POST /api/requests/:requestId/book**
Called when the user selects a provider and taps "Book via WhatsApp." Triggers the Twilio WhatsApp message to the provider and opens the WebSocket room for real-time updates.

**POST /api/requests/:requestId/reply**
Called when the user provides guidance for an ambiguous provider message. The AI uses this input to compose and send the next WhatsApp message.

**GET /api/requests/history**
Returns a list of the current user's past requests with their statuses, for the sidebar history view.

**POST /webhook/twilio/whatsapp**
This endpoint has NO authentication header — it is called directly by Twilio when a provider replies on WhatsApp. It is secured by validating Twilio's request signature instead. On receiving a message, it parses the Request ID from the message body, updates the correct request document in MongoDB, and emits a Socket.io event to the correct user's browser.

---

## The Gemini AI Agent — How It Works

The Gemini agent is the intelligence layer of ServeAI. Understanding exactly what it does and how it makes decisions is essential for implementing it correctly.

The agent receives a system prompt that defines its role and capabilities, and then receives the user's request along with their preferences as context. It uses tool calls to perform actions — calling the Maps API, composing WhatsApp messages, and deciding when to ask the user for input — rather than just generating text.

**The system prompt given to Gemini at every request:**

```
You are ServeAI's booking agent. Your job is to help users find and book local service providers via WhatsApp.

When given a user's request:
1. Extract the service type and any specific details from their message
2. Use the search_nearby_providers tool to find real businesses matching their request
3. Evaluate the results against the user's preferences (radius, price range, minimum rating)
4. Select the 3 best matches and write a one-sentence explanation for why each is recommended
5. Return the results in the structured format specified

When composing WhatsApp messages to providers:
- Always begin with the Request ID in brackets: [REQ-XXXXX]
- Introduce the user's need clearly and professionally
- Do not share the user's personal phone number or exact address without permission
- Use the user's area name (e.g., "DHA, Lahore") for location
- Keep messages concise and professional

When a provider's reply is ambiguous or asks something the user needs to answer:
- Set requiresUserInput to true in your response
- Summarize what the provider is asking in simple language for the user
- Do NOT compose a response on your own for questions that need user input

You operate on behalf of real people arranging real services. Accuracy and trust are your highest priorities.
```

**Tool definitions provided to Gemini:**

The agent has access to two tools. The first tool, `search_nearby_providers`, takes a service query string, latitude, longitude, and radius as inputs, and calls the Google Maps Places API. The second tool, `compose_whatsapp_message`, takes a Request ID, provider name, user area, and conversation context, and composes a professional WhatsApp message to send to the provider.

---

## The Request ID System — Critical for Multi-User Correctness

This section is important enough to be explained in detail because getting it wrong breaks the entire multi-user experience.

The core problem is this: when User A and User B both want ABC Plumber, your system sends two separate WhatsApp messages from your single business number to ABC Plumber's number. From the plumber's perspective, both messages appear in the same chat thread. His reply is ambiguous — which request is he responding to?

The solution is to embed a unique Request ID in every single outbound message, and to train the system to parse Request IDs out of inbound replies.

Every booking gets a Request ID generated when the request is created:
```javascript
// Generate a unique readable Request ID
function generateRequestId() {
  const number = Math.floor(Math.random() * 90000) + 10000; // 5-digit number
  return `REQ-${number}`;
}
```

Every outbound WhatsApp message to a provider begins with this ID in brackets:
```
[REQ-00142] Hello! A user near DHA Lahore needs plumbing service today. 
Are you available this afternoon?
```

When the Twilio webhook receives an inbound message from a provider, the backend first attempts to extract a Request ID from the message body using a regex pattern:
```javascript
function extractRequestId(messageBody) {
  const match = messageBody.match(/\[REQ-(\d{5})\]/);
  return match ? `REQ-${match[1]}` : null;
}
```

If the provider included the ID in their reply (which professional providers will do once they understand the system), the routing is exact. If the provider did not include the ID, the backend falls back to looking up the most recent active request that sent a message to that provider's phone number within the last hour. If there is still ambiguity (two active requests to the same provider), the system sends a clarifying message to the provider: "Hi, could you include [REQ-XXXXX] at the start of your reply so we know which request you're responding to?"

---

## Authentication Flow — Step by Step

This section exists because authentication was the biggest technical blocker in the previous hackathon. Every step is explained so there is no ambiguity.

**Step 1: User opens the app**
The React app loads. The Firebase `onAuthStateChanged` listener fires immediately. If no user is authenticated, the app renders the Login screen. If a user is already authenticated (returning user), the app skips to the main screen.

**Step 2: User clicks "Sign in with Google"**
The frontend calls `signInWithPopup(auth, googleProvider)`. Firebase opens Google's OAuth popup. The user selects their Google account and grants permission. Firebase returns a `UserCredential` object containing the user's Firebase UID, email, display name, and photo URL.

**Step 3: Frontend sends token to backend**
The frontend calls `user.getIdToken()` to get a short-lived JWT token, then sends it to the backend's `/api/auth/verify` endpoint in the Authorization header.

**Step 4: Backend verifies the token**
The backend uses `admin.auth().verifyIdToken(token)` from the Firebase Admin SDK. This makes a secure server-side call to Firebase to confirm the token is genuine and not expired. If valid, it returns the decoded token containing the user's Firebase UID.

**Step 5: Backend creates or retrieves user in MongoDB**
The backend does a `findOneAndUpdate` on the users collection using the Firebase UID as the key. If the user exists, it returns their profile. If not, it creates a new user document with the email and name from the Firebase token, and returns it. This is the `upsert` pattern.

**Step 6: Frontend receives user profile and determines next step**
If the returned user document has a phone number (meaning profile setup was already completed), the app navigates to the main screen. If phone is missing, the app navigates to the profile setup screen.

**Step 7: All subsequent API calls**
For every subsequent API call, the frontend gets a fresh token with `user.getIdToken()` (Firebase automatically handles token refresh before expiry) and includes it in the Authorization header. The backend verifies it on every request.

This entire flow should take no longer than two hours to implement following the Firebase documentation.

---

## Environment Variables — Complete List

Never commit these to GitHub. Store them in a `.env` file in the backend directory which is listed in `.gitignore`, and set them as Cloud Run environment variables for production deployment.

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/serveai

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx

# Vertex AI
VERTEX_AI_LOCATION=us-central1

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio Sandbox number

# App Configuration
PORT=8080                           # Cloud Run uses port 8080 by default
FRONTEND_URL=https://your-app.web.app  # Firebase Hosting URL for CORS
NODE_ENV=production
```

The frontend needs its own environment variables in a `.env` file in the React project directory. Vite requires these to be prefixed with `VITE_`:

```
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_BACKEND_URL=https://your-backend-service-url.run.app
```

---

## Error Handling Strategy

Every API endpoint must handle failures gracefully. The demo video must not show a crash or an empty screen when something goes wrong. Here is the error handling pattern for each failure scenario.

If the Google Maps API returns zero results, the backend sends back an empty array and a message: "No providers found nearby. Try increasing your search radius in settings." The frontend displays this as a friendly card, not an error message.

If the Gemini API is slow or fails, the backend retries once after a 2-second delay. If it fails again, it returns a fallback response: "I had trouble processing that request. Please try again." The request document is marked with status "failed" in the database.

If the Twilio WhatsApp message fails to send (for example, if the provider's number is not on WhatsApp), the frontend shows: "We couldn't reach this provider on WhatsApp. Would you like to try another option?" and re-displays the results screen.

If a database write fails, the error is logged to Google Cloud's built-in logging system (console.error goes to Cloud Logging automatically on Cloud Run), and the user sees: "Something went wrong saving your request. Please try again." The app must never show a raw JavaScript error or stack trace to the user.

---

## Deployment Instructions

**Backend deployment to Cloud Run:**

The backend Dockerfile is a standard Node.js container:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "index.js"]
```

Deploy with:
```bash
gcloud run deploy serveai-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI=xxx,GOOGLE_MAPS_API_KEY=xxx
```

**Frontend deployment to Firebase Hosting:**
```bash
npm run build        # Creates the dist/ folder
firebase deploy      # Uploads dist/ to Firebase Hosting
```

Both commands should be run after every significant change to keep the hosted demo updated.

---

*This document is version 1.0, created May 23, 2026.*
*Architecture may evolve as development progresses. Update this file when significant architectural decisions change.*
