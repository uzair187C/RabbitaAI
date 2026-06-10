# RabbitaAI — Context Report for Claude
*(Generated on June 7, 2026)*

This document summarizes all major architectural updates, UI redesigns, and AI reasoning changes implemented in the project recently. Use this as your primary source of truth for the current state of the application.

---

## 1. UI Redesign (Luminous Hearth & Stitch UI)
The entire frontend has been overhauled to integrate premium UI designs from Stitch.

| Component | Status | Key Features & Changes |
|-----------|--------|----------------------|
| `index.css` | ✅ Updated | New font imports (Inter, etc.), 18 new design tokens, global animations (`ticker`, `stagger-in`). |
| `HomeScreen.jsx` | ✅ Rewritten | Dynamic greetings, live service ticker, chat bubbles, typing indicators, suggestion chips, command bar, bottom nav. Removed taxi/transport options. |
| `BookingFeed.jsx` | ✅ Rewritten | Preserves all 7 socket events. Added race mode banner, vertical timeline with brand dots, question card, timeout card, add-on input, and a slide-up raw WhatsApp conversation sheet. |
| `OrderScreen.jsx` | ✅ Created | New screen modeled after Stitch "Order Status". Editable order, shop info, timeline, add note. |
| `ReceiptScreen.jsx` | ✅ Rewritten | 5-step animation (circle draw → checkmark → confetti → fade), glass receipt card, share/copy actions. |
| `HistoryScreen.jsx` | ✅ Rewritten | Filter pills, stagger-in cards, emoji detection, empty state, and nav to `/booking` or `/order`. Old chats open inline. |
| `ProfileSetup.jsx` | ✅ Rewritten | 2-step wizard, map visual, slider, stars, chips, language grid. Added "Exact Address" requirement and Country Code dropdown (defaults to 🇵🇰 +92). |
| `Login.jsx` | ✅ Updated | Hero stats, glass card, spinner, Google auth integration. |

---

## 2. Gemini Reasoning & Ontology Mapping (Major Rework)
The `geminiService.js` intent analysis logic was fundamentally restructured. We abandoned "decision-tree hardcoding" because it suffocated the AI's natural reasoning. Instead, we shifted to **Ontology Mapping** surrounded by code-level guardrails.

### The 3-Layer Intent Defense System
The `analyzeIntent` function now operates in 3 deterministic layers:

1. **Layer 1: Code Pre-Filter (Deterministic, 100% Reliable)**
   - A fast Regex catches all greetings (`hey`, `hi`, `good morning`, `sup`) and vague mood statements (`"I'm hungry"`, `"help me"`).
   - If caught, Gemini is *not called at all*. The backend instantly returns a `chat` or `clarify` action. Zero latency, zero failure rate.
   
2. **Layer 2: Simplified Gemini Prompt (Ontology Mapping)**
   - The prompt was cut from ~80 lines to ~40 lines.
   - **Core Instruction:** Map casual human desires to real Google Maps business categories (e.g., "I need a biscuit" → "supermarket", "my pipe broke" → "plumber").
   - **Missing Specifics:** If the user hasn't provided enough details to order (e.g., "I want pizza"), the AI asks *one* clarifying question (size, flavor, brand) instead of blindly searching.
   - Default fallback is now `clarify`, preventing garbage Google Maps searches when the AI is uncertain.

3. **Layer 3: Code Post-Filter (Validation)**
   - Validates Gemini's JSON output to catch AI hallucinations.
   - If `action` is `search` but `primaryQuery` is >40 characters (hallucinated sentence instead of a category), it overrides to `clarify`.
   - If `searchQueries` contains *only* banned words (e.g., "hey", "morning"), it overrides to `clarify`. (Note: The filter was explicitly relaxed to allow valid raw user text like "Zinger burger").

### Multilingual & Context Injection
- The backend orchestrator now explicitly pulls the user's chosen `language` and `exactAddress` from their MongoDB profile and injects them into the Gemini prompt. 
- Gemini will now seamlessly converse in the user's preferred language (e.g., Urdu, Arabic) and already knows their house number for the provider.

### Strict Brand Rule
- Implemented in `rankProviders()`. If a user mentions a specific brand (e.g., "Cheezious"), Gemini is strictly forbidden from recommending competitors (e.g., "Domino's").

---

## 3. WhatsApp Notification & Webhook Routing Fixes
The production WhatsApp flow via Twilio / Meta API received significant hardening.

- **Token Refresh:** Meta API access tokens were updated in `env.yaml` and `.env` to resolve 401 Unauthorized errors.
- **Provider Names Restored:** Removed the `DEMO_MODE` override that replaced actual business names with a generic "Sandbox Provider". Messages routed to the test number now correctly address the real business (e.g., "Hello Cheezious!").
- **Specific Requirements Passed:** User constraints and answers to clarifying questions (e.g., "Crown crust, Family size") are now actively passed into the `composeBookingMessage()` so the provider knows exactly what to do instantly.
- **Webhook Deduplication:** Handled message deduplication so the AI doesn't process the same message twice.
- **Cancellation Flow:** Pressing "Cancel" in the UI now explicitly fires a `/cancel` route that sends a cancellation notice to the provider via WhatsApp before closing the booking.
- **Add-on Messaging:** Implemented the `/addon` route to allow the user to send follow-up instructions directly to the business.

---

## 4. Known Blockers / Notes
- **WhatsApp Tokens:** We are still using the Meta Developer Sandbox with temporary tokens. These expire every 24 hours. A permanent OAuth-based refresh flow remains a future infrastructure requirement. 
- **Demo Mode:** `DEMO_MODE` is active, meaning outbound WhatsApp messages fire to `TEST_PROVIDER_PHONE`. Ensure this number is verified in the Meta Developer Console or messages will silently drop.
