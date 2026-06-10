# ServeAI — Master Plan
### Hackathon → Startup Roadmap
*Written May 23, 2026 — 19 days to submission (June 11)*

---

## 1. Your App Identity

Before writing code, your project needs a name and identity. Here's a suggestion:

**Name: ServeAI** (or ServeIt, NearServe, TaskFlow — pick what feels right to you)
**Tagline:** *"You type it. We handle it."*
**One-liner:** An AI agent that finds real nearby service providers and books them for you — via WhatsApp — without you leaving the app.

**Accounts to set up TODAY:**
- Create a new Gmail: `serveai.app@gmail.com` (or your chosen name). This becomes your business identity going forward — keep it separate from your personal account.
- Sign up for Google Cloud using this new email. This keeps your startup's cloud project clean and professional from day one.
- Create a GitHub account or repo under this identity: `github.com/serveai` or similar.
- Register on MongoDB Atlas (free) using the same email.
- Register on Twilio (free trial) using the same email.

---

## 2. The Official Demo Script

This is your north star. Every feature you build either appears in this script or waits for post-hackathon. Print it. Read it before every coding session.

> **Scene:** Ayesha opens ServeAI on her browser. She logs in with Google in one click. Her profile is already set up with her area (DHA, Lahore), preferred radius (5km), and preference for mid-range pricing. She types: *"I need a plumber today, something's leaking under my kitchen sink."* The app shows a thinking animation, then presents 3 real nearby plumbers from Google Maps — each with a name, rating, distance, and a one-line AI explanation of why it was recommended. Ayesha picks the second one. The app says: *"Sending request to Al-Rehman Plumbing via WhatsApp..."* A live feed appears on screen showing the conversation happening in real time. The AI introduces Ayesha's request, mentions she's in DHA and needs service today. The plumber replies asking for timing. The AI doesn't guess — it surfaces a prompt to Ayesha: *"The provider is asking: what time works for you?"* Ayesha types "3pm". The AI sends it. Plumber confirms. The app generates a booking receipt and displays it to Ayesha. Done.

That's your 3-minute video. Everything else is noise until that works perfectly.

---

## 3. The WhatsApp Multi-User Same-Business Problem — Solved

This is the most important architectural problem to understand before you write any code.

**The problem:** User A and User B both want ABC Plumber. Your system sends two WhatsApp messages from your business number to ABC Plumber's number. From the plumber's perspective, both messages arrive in the same chat thread with your business. His reply is ambiguous — is he replying to request 1 or request 2?

**The solution: Request ID tagging on every single message.**

Every booking your system creates gets a unique Request ID, like `REQ-00142`. Every message your AI sends to the provider includes this ID clearly. It looks like this:

```
[REQ-00142] Hello! A user near DHA Lahore needs plumbing service 
today. Are you available this afternoon?
```

And the second request:

```
[REQ-00189] Hello! Another customer in Gulberg needs urgent pipe 
repair. Are you available today?
```

Now the plumber sees two clearly labelled conversations in one thread. When he replies "Yes available for REQ-00142", your backend parses the incoming message, extracts the request ID, and routes the reply to the correct user's live feed. If he doesn't include the ID (because people don't always follow instructions), your AI reads the context of his reply and figures out which request it most likely belongs to, then asks for confirmation if unsure.

On the backend, your database stores each conversation as a separate document keyed by Request ID, not by phone number pair. This completely solves the problem and also gives you a clean audit trail for every booking — which is exactly what your startup's trust and safety layer needs.

**For the startup long-term:** As your volume grows, you'll eventually want a dedicated WhatsApp number per city or service category. Lahore gets one number, Karachi gets another. This is a $0 architectural decision now that pays dividends later.

---

## 4. Your Complete Tech Stack — Every Tool Explained

Think of the stack in four layers, each one serving the next.

**Layer 1 — The Brain (AI)**
Use **Gemini 2.0 Flash** via Google Cloud Vertex AI. Not the regular Gemini API — Vertex AI because that's what the hackathon scoring rewards, and it includes your $100 credits. Flash is fast and cheap, which matters for real-time conversation flows. This is the model that understands the user's request, calls tools, reads Maps results, writes WhatsApp messages, and decides when to ask the human for input.

**Layer 2 — The Data (Database)**
Use **MongoDB Atlas** on the free M0 tier. This is your hackathon track requirement and it genuinely fits your use case better than Firestore for this project. You'll have collections for Users, Requests, Conversations, and Providers. MongoDB's flexible document structure means a request can store its entire conversation history as a nested array — no complex joins needed.

**Layer 3 — The Connective Tissue (Backend)**
Use **Node.js with Express** deployed on **Google Cloud Run**. Cloud Run is serverless — it scales automatically and you only pay when it's actually handling requests. With your $100 credits, you can run thousands of requests for free. Your backend handles authentication, calls the Maps API, manages the Gemini agent, sends/receives WhatsApp messages via Twilio, and pushes real-time updates to the frontend.

**Layer 4 — The Face (Frontend)**
Use **React** (with Vite for fast setup). Keep it simple and clean — a login screen, a profile setup screen, and a main chat interface with the live feed sidebar. No complex UI framework needed. Tailwind CSS for styling. Host it on **Firebase Hosting** (free tier) — it's the fastest way to get a public URL for your demo.

**Supporting Services:**
- **Firebase Authentication** for Google Sign-In. This is the easiest implementation of Google login that exists — literally 10 lines of code. This was your pain point last time. Firebase Auth removes all that complexity.
- **Google Maps Places API** for finding nearby businesses.
- **Twilio WhatsApp Sandbox** for sending/receiving WhatsApp messages during the hackathon.
- **MongoDB MCP Server** for the agent to query and update the database using natural language tool calls.

---

## 5. The Token Problem — Solved Permanently

This was killing you before because you were using Claude (Anthropic's model) for vibe coding through the Anthropic Consumer API, which has strict free tier limits. You were burning through tokens on your *coding tool*, not on your *app*. Here's how to never have this problem again.

**For vibe coding (building the app):** Use **Cursor IDE**. It's a code editor built on VS Code that has Claude and GPT built in. The Pro plan is $20/month and gives you essentially unlimited fast requests for coding. It can read all your files, understand your whole codebase, run commands, and debug — it's exactly what you described wanting. This replaces the chaotic "open 15 accounts" approach with one paid tool that never runs out mid-session.

**For your app's AI (what users interact with):** Use **Gemini Flash** via Vertex AI. It's dramatically cheaper than Claude API — roughly $0.075 per million input tokens. For a hackathon demo with maybe a few hundred requests, you'll spend maybe $0.50 total. The $100 credits cover this entirely. No token anxiety.

**The key insight:** Keep your *coding assistant* (Cursor/Claude) completely separate from your *app's AI* (Gemini). You were mixing them before and paying coding token costs from your app's budget. These are two different tools for two different purposes.

---

## 6. Claude Code vs Local Models (Ollama/NVIDIA)

You asked about this specifically so let me explain exactly what each thing is.

**Claude Code** is Anthropic's command-line tool that runs in your terminal. You open it, and it can read every file on your computer, run code, open browsers, search the web, and write code across your whole project simultaneously. It's genuinely powerful. However, it uses Claude's API which costs tokens, and at your usage level you'd burn through credits quickly. It's best for specific focused tasks, not hours-long coding sessions.

**The NVIDIA/Ollama local model** setup you saw in that video is a completely different thing. Ollama is a tool that lets you download and run open-source AI models (like Llama 3, Mistral, etc.) directly on your own computer using your GPU. The "NVIDIA" part means it uses your graphics card to run the model. On a 4GB GPU, you can run small models (7 billion parameters) but they're noticeably less intelligent than Claude or Gemini. They're good for simple code completion but struggle with complex multi-file reasoning.

**What I'd actually recommend for you:** Use **Cursor Pro** ($20/month) as your primary coding tool. It integrates Claude Sonnet into a full IDE, can see all your files, has inline chat, can apply changes directly to your code, and has generous limits for the subscription price. It's the closest thing to what you described wanting — an AI that knows your whole project and can help you fix anything. It's worth far more than $20 in productivity for a hackathon sprint.

---

## 7. The 19-Day Build Plan

You have from today (May 23) to June 11. Here is your day-by-day plan. Think of it in four phases.

### Phase 1: Foundation (Days 1–3, May 23–25)
These three days are about getting all your accounts set up and getting "hello world" versions of each service talking to each other. No real features yet — just plumbing.

On Day 1, create all your accounts (Gmail, Google Cloud, MongoDB Atlas, Twilio, GitHub). Set up a new Google Cloud project, enable Vertex AI and Maps APIs, and activate your $100 credits. Install Node.js, create a basic Express server, and deploy it to Cloud Run even if it just says "Hello World". Seeing your server live on the internet on Day 1 is a massive confidence boost and removes deployment anxiety later.

On Day 2, set up Firebase Authentication in a basic React app. Get Google Sign-In working. This is the thing that took you two days last time — with Firebase Auth it should take two hours. When a user clicks "Sign in with Google" and you can log their email to the console, Day 2 is done.

On Day 3, connect MongoDB Atlas. Create your collections (Users, Requests, Conversations). Write one user to the database after login. Call the Google Maps Places API with a hardcoded query ("plumbers in Lahore") and log the results. By end of Day 3 you have auth, database, and Maps all individually working.

### Phase 2: Core Intelligence (Days 4–9, May 26–31)
This phase builds the actual AI brain of the app.

Days 4–5 are about the Gemini agent. Set up Vertex AI, connect the MongoDB MCP server, and get Gemini to take a user's text request, call the Maps API as a tool, and return structured results (name, rating, distance, why recommended). This is the hardest technical piece of the whole project. Allocate two full days.

Days 6–7 are the WhatsApp integration. Set up Twilio Sandbox, connect your WhatsApp to it, and get your server to send a message to a provider's number with a Request ID. Then set up the webhook so when the provider replies, your server receives it and updates the database. Test the full loop: send message → provider replies → your server gets it.

Days 8–9 are connecting it all together. User logs in → types request → Gemini finds providers → user picks one → system sends WhatsApp → reply comes back → updates live feed. This is the first time the full demo script works end-to-end, even if it's ugly.

### Phase 3: Polish and UX (Days 10–14, June 1–5)
Now you make it look and feel real.

Day 10–11: Build the proper frontend. Profile setup screen (name, phone, area, radius preference). Main chat interface. The live feed that shows the WhatsApp conversation in progress. The "AI needs your input" prompt when the provider asks something unexpected.

Day 12: Implement the Request ID system properly so multiple users can simultaneously contact the same provider without confusion. Test it with two browser windows.

Day 13: Error handling and edge cases. What happens if no providers are found? What if the Maps API returns zero results? What if Twilio fails? Every possible failure should show a friendly message, not a crash.

Day 14: Mobile responsiveness. Your demo video might be shot on a phone, and judges will look at the app on their phones too.

### Phase 4: Demo and Submission (Days 15–19, June 6–11)
Day 15: Full end-to-end test. Run the entire demo script three times. Fix whatever feels slow or broken.

Day 16: Record your demo video. 3 minutes maximum. Structure it as: 30 seconds explaining the problem (people waste time finding and calling service providers), 2 minutes showing the full demo, 30 seconds on the tech stack and what makes it different (real Maps data, real WhatsApp, human-in-the-loop AI). Show it in Lahore or Karachi — real city, real problem.

Day 17: Write your Devpost submission. Describe the problem, your solution, your tech stack, what you learned, and what's next (the startup). This matters more than most people realize — judges read it before watching the video.

Day 18: Buffer day. Fix anything that needs fixing. Re-record video if needed.

Day 19 (June 10): Submit. Don't wait until June 11 — if your internet dies or your laptop crashes on the last day, you miss the deadline again. Submit a day early.

---

## 8. Scalability Roadmap — From Hackathon to Million-Dollar App

Here's how your app scales at each stage of growth.

**Stage 1 — Hackathon Demo (0–100 users)**
Everything runs on free tiers. Cloud Run handles a few concurrent users. MongoDB Atlas M0 (free). Twilio Sandbox. Firebase Hosting free tier. Cost: $0 beyond your $100 credits.

**Stage 2 — Early Startup, Post-Hackathon (100–10,000 users)**
Upgrade MongoDB to M10 paid cluster ($57/month) for performance and backups. Apply for real WhatsApp Business API approval using your legal business name — start this process immediately after the hackathon because it takes 2–4 weeks. Add Firebase Phone Auth for OTP verification (you wanted this). Add basic analytics (Mixpanel free tier) so you know which service categories are most requested. Estimated monthly cost: ~$100–150. Revenue model: charge a 5–10% booking fee per confirmed transaction, or charge service providers a monthly subscription to be featured.

**Stage 3 — Regional Growth (10,000–500,000 users)**
Multi-city support with city-specific WhatsApp numbers. A provider onboarding portal where businesses can register themselves and set their availability. Redis caching layer to reduce Maps API calls (cache nearby businesses for 24 hours — they don't move). Cloud Run auto-scaling handles traffic spikes automatically. Estimated monthly cost: $500–2,000. At this stage you're looking for seed funding using your traction numbers.

**Stage 4 — Scale (500,000+ users)**
Microservices architecture — separate services for auth, booking, messaging, and AI. Multi-region deployment (Pakistan, Middle East, Southeast Asia — all WhatsApp-heavy markets). Your own fine-tuned model for understanding local service requests in Urdu, Arabic, etc. A marketplace where providers bid on requests. This is the $10M+ revenue territory.

**The core insight for scaling:** Your unfair advantage is WhatsApp penetration in emerging markets. Pakistan, Bangladesh, Nigeria, Indonesia, Brazil — these are countries where WhatsApp is the primary communication channel AND where local service booking is still done by phone calls and word of mouth. You're not competing with Uber Eats. You're creating a category.

---

## 9. What To Do Right Now — Today

Stop reading and do exactly these four things in order.

First, create `serveai.app@gmail.com` (or your chosen name). This takes 5 minutes.

Second, sign into Google Cloud with that email, create a new project called "ServeAI", and activate the $100 free credits. Enable the Vertex AI API and Maps Places API.

Third, sign up for Cursor at cursor.com. Start the free trial. Open it, point it at an empty folder, and ask it to scaffold a basic Node.js Express server. See how it works. Get comfortable with it today.

Fourth, create your MongoDB Atlas account, create a free M0 cluster, and copy your connection string somewhere safe.

That's it for today. Four accounts, one working server. Tomorrow you build Google login. The day after, Maps. Day by day, brick by brick.

You've got this. The idea is real, the vision is clear, and you've already proven you can build something at this level. The only difference this time is you have a plan before you start.

---

*Last updated: May 23, 2026*
*Deadline: June 11, 2026 — 19 days*
