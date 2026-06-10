# ServeAI — Complete UI/UX Specification
### File 3 of 4 | Every screen, every button, every visual decision

---

## How to Read This Document

This document describes the complete visual and interaction design of ServeAI. Every screen is described in detail — what elements appear, what they do, what text they contain, and how the user moves between them. When an AI coding assistant is generating a UI component, it should reference the relevant screen section from this document to understand exactly what to build.

---

## Design Philosophy

ServeAI handles something personal and high-stakes: booking strangers to come to your home or business. The design must communicate trust, competence, and calm reliability above all else. It should feel like a premium professional service, not a flashy startup experiment. The user handing a task to an AI agent needs to feel that the AI is in control and trustworthy, not that it might misunderstand and embarrass them.

The visual language draws inspiration from the intersection of a high-end fintech app (clean, precise, trustworthy) and WhatsApp itself (familiar chat bubbles, green tones as a recognizable signal of messaging). The result is an interface that feels both sophisticated and immediately understandable to someone who has never seen it before.

---

## Design Tokens — The Complete Visual System

These values must be defined as CSS variables at the root level and used consistently throughout the entire application. No hardcoded colors or font sizes anywhere in the codebase.

**Color Palette**

The primary background is `#0F1117` — a deep near-black that is dark but not harsh on the eyes in evening use, which is when people most often realize they need to book a service. The surface color for cards and panels is `#1A1D27`, slightly lighter than the background to create depth without using borders. The elevated surface (modals, dropdowns, active elements) is `#252836`.

The primary brand color is `#00C896` — a confident teal-green that bridges the worlds of trust (green) and technology (teal). This is used for primary buttons, active states, and the brand logo. The secondary accent is `#0EA5E9` — a clear blue used for informational states and secondary actions. The warning color is `#F59E0B` for caution states. The error color is `#EF4444` for failure states. The success color matches the primary brand at `#00C896`.

Text uses three levels. Primary text is `#F0F4F8` — near-white but not pure white, which reduces eye strain on dark backgrounds. Secondary text is `#8B95A5` for labels, placeholders, and supporting information. Disabled text is `#4A5568`.

The WhatsApp conversation area specifically uses `#075E54` (the classic WhatsApp dark green) as the header color to create an immediately recognizable visual signal that the user is watching a real WhatsApp conversation.

**Typography**

The display font is `'Plus Jakarta Sans'` — a modern geometric sans-serif with excellent readability and a slightly premium character. Import it from Google Fonts. It is used for headings, the brand name, and hero text on the login screen. The body font is `'Inter'` — clean, neutral, and highly legible at small sizes. It is used for all body text, labels, and UI elements. The monospace font is `'JetBrains Mono'` used only for the Request ID display (e.g., REQ-00142) to give it a distinct technical identity.

Font size scale: 12px for small labels and captions, 14px for body text and form inputs, 16px for primary body text and button labels, 20px for card titles and section headings, 24px for screen titles, 32px for the hero tagline on the login screen.

**Spacing System**

All spacing uses multiples of 4px. The most commonly used values are 4px (micro gaps between inline elements), 8px (gaps between related elements within a component), 12px (padding inside small components like chips), 16px (the standard internal padding for cards and input fields), 24px (spacing between components on a screen), 32px (spacing between major sections), and 48px (the top and bottom padding of full screens).

**Border Radius**

Small interactive elements like chips and badges use 6px. Form inputs and small cards use 10px. Main cards use 14px. The chat input bar uses 20px. Modal overlays use 20px. The brand logo mark uses 16px.

**Shadows**

Cards use `box-shadow: 0 2px 12px rgba(0,0,0,0.4)` to lift them subtly off the background. The bottom navigation and top header use `box-shadow: 0 1px 0 rgba(255,255,255,0.06)` to separate them from content with a subtle border effect. Modals use `box-shadow: 0 8px 32px rgba(0,0,0,0.6)` for a strong separation from the background.

---

## Screen Inventory — Every Screen in the App

The app has eight distinct screens. Below each screen is described in complete detail.

---

### Screen 1: Splash / Loading Screen

**When it appears:** For approximately 1.5 seconds while Firebase is initializing and checking whether the user is already logged in.

**What appears:** The app's full dark background fills the screen. Centered vertically and horizontally, the ServeAI wordmark appears in Plus Jakarta Sans, 28px, brand teal `#00C896`. Beneath the wordmark, the tagline "You type it. We handle it." appears in secondary text color `#8B95A5`, 14px, Inter. Below both, a subtle loading animation — three small dots in the brand teal color that pulse in sequence (not a spinning wheel, which feels aggressive; dots feel calm and deliberate).

**Transition:** When Firebase finishes checking auth state, the screen fades out over 300ms and the appropriate next screen fades in.

---

### Screen 2: Login Screen

**When it appears:** When Firebase confirms no user is currently authenticated.

**What appears:** The screen is divided visually into two zones. The top 60% of the screen contains the hero section: a subtle gradient from `#0F1117` at the top to a slightly warmer `#131820` toward the center. The ServeAI logo mark appears — a small abstract icon representing a speech bubble with a location pin inside it, in teal. Below the icon, the brand name in Plus Jakarta Sans 32px. Below that, the tagline in 16px secondary text. Below the tagline, a single line of trust-building text: "Trusted by thousands across Lahore, Karachi, and beyond." in 12px secondary text.

The bottom 40% of the screen is a card that slides up slightly when the screen loads (200ms ease-out animation). Inside the card, a header text reads "Get started" in 20px primary text, Plus Jakarta Sans. Below it, body text reads "Sign in to find and book any service near you." in 14px secondary text. Below the body text, a full-width Google Sign-In button.

The Google Sign-In button is 52px tall, with border-radius 10px, background `#1A1D27`, a 1px border of `rgba(255,255,255,0.1)`. Inside the button, the official Google "G" icon (SVG) appears on the left side. The button text reads "Continue with Google" in 16px Inter medium weight, primary text color. On hover, the background lightens to `#252836` with a smooth 150ms transition. On click, the button shows a spinner replacing the Google icon while Firebase's popup opens.

Below the button, fine print in 12px secondary text: "By continuing, you agree to our Terms of Service and Privacy Policy." These are not links in the MVP — they can be placeholder pages hosted on Firebase.

**Error state:** If the Google Sign-In popup is closed by the user without completing login, a small toast notification slides in from the bottom: "Sign-in cancelled. Please try again." It disappears after 3 seconds.

---

### Screen 3: Profile Setup Screen

**When it appears:** Only once, the first time a user signs in and their MongoDB profile does not yet have a phone number.

**Purpose:** To collect the four pieces of information needed to make the first service request as personalized as possible.

**What appears:** A top bar with a back button (left arrow icon) on the left — this allows the user to go back to the login screen if they accidentally signed in with the wrong Google account. The screen title "Set up your profile" in 24px Plus Jakarta Sans, primary text. Below the title, a progress indicator showing Step 1 of 2 (profile info) and Step 2 of 2 (preferences) as two dots, the current step filled in teal.

**Step 1 — Basic Info:** Three input fields stacked vertically with 16px spacing between them. The Name field is pre-filled with the name from the user's Google account and is editable. The Phone Number field shows a Pakistan flag emoji and +92 prefix, with a placeholder "3XX XXXXXXX" for the local number format. There is a small info icon next to the phone field label with a tooltip: "Used to contact you if a provider needs to reach you directly." The Area / Neighbourhood field is a text input with placeholder "e.g. DHA Phase 5, Lahore" and a small location pin icon on the right side of the input that, when tapped, requests the browser's geolocation permission. A "Next" button at the bottom, full-width, in the brand teal.

**Step 2 — Preferences:** Three preference controls. The Search Radius control shows a horizontal slider from 1km to 25km, with the current value displayed as "5 km" in a teal badge above the thumb. The Price Range control shows three pill-shaped toggle buttons: "Budget", "Mid-range", and "Premium" — the selected one fills with teal. The Minimum Rating control shows five star icons, the user taps to select minimum acceptable rating. Below the controls, a "Save and Continue" button in teal.

**Validation:** The "Next" button on Step 1 is greyed out and non-interactive until the name and phone fields both have valid content. If the phone field contains fewer than 10 digits when Next is tapped, the field border turns red and a small error label appears below: "Please enter a valid Pakistani phone number."

---

### Screen 4: Main Home Screen

**When it appears:** After successful authentication and profile completion. This is where the user spends most of their time.

**Layout:** The screen is divided into three zones. The top navigation bar (56px height) contains the ServeAI logo on the left, the user's profile photo (circular, 32px) on the right as a tap target that opens settings. The main content area fills the rest of the screen. The bottom navigation bar (64px height) contains three icon buttons: Home (house icon, active by default), Requests (clock/history icon), and Profile (person icon).

**Main Content — New Request State:** When the user has no active requests, the main content area shows a clean centered empty state. A large teal speech bubble icon at the top. Below it, "What do you need today?" in 24px Plus Jakarta Sans. Below that, "Tell me anything — plumber, electrician, pizza, groceries, cleaning..." in 16px secondary text. Below that, the input bar.

The input bar is a fixed element at the bottom of the content area, sitting just above the bottom navigation. It is 56px tall with border-radius 20px, background `#1A1D27`, and a 1px border of `rgba(0,200,150,0.3)` (a subtle teal glow). Inside: a microphone icon on the left (disabled in MVP, grayed out with a "coming soon" tooltip), a text input in the middle with placeholder "Type your request...", and a send button on the right — a circle in teal with a white arrow icon. The send button is greyed out when the input is empty and activates as soon as any text is typed.

**Main Content — Active Request State:** When a request is in progress, the main content area transforms into the chat view. Previous messages appear as chat bubbles: user messages in teal on the right side, AI responses as white-text bubbles on a dark `#252836` background on the left side.

---

### Screen 5: Provider Results Screen

**When it appears:** After the Gemini agent processes the user's request and returns provider options. This replaces the thinking animation that was showing.

**What appears:** The AI's response message bubble shows first: "I found 3 providers near DHA, Lahore that match your preferences." Then, three Provider Cards appear stacked vertically.

Each Provider Card is 80px tall with border-radius 14px, background `#1A1D27`, and a subtle 1px border of `rgba(255,255,255,0.06)`. Inside the card: on the left, the provider's initial letter in a circular badge (colored based on their category — teal for home services, orange for food, blue for retail). In the middle column, the provider name in 16px primary text (bold) on the first line, and the AI's one-sentence explanation in 12px secondary text on the second line. On the right column, the star rating in 14px with a small yellow star icon on the first line, and the distance in teal on the second line.

The card has a subtle right arrow icon at the far right indicating it is tappable. On tap, the card scales down slightly (transform: scale(0.98)) for 100ms then scales back up, confirming the selection.

Below the three provider cards, a link-style text button in secondary text: "Not seeing what you need? Ask for more options →" Tapping this sends a message back through the chat: "Show me more options" and triggers a new Maps search with a wider radius or different parameters.

---

### Screen 6: Live Booking Feed Screen

**When it appears:** After the user taps a provider card and the booking process begins.

**What appears:** The top of the screen shows a booking status bar — a card with the provider name, a pulsing green dot labeled "Booking in progress", and the Request ID in JetBrains Mono 12px below the provider name.

Below the status bar, the WhatsApp conversation feed. The feed header bar is `#075E54` (WhatsApp dark green), 48px tall, with the provider name in white Inter 16px on the left and a small WhatsApp logo icon on the right. This visual treatment immediately communicates "this is a WhatsApp conversation happening" without any explanation needed.

Conversation messages appear in the WhatsApp visual style: outbound messages (sent by the AI on your behalf) appear as green-background bubbles on the right side, labeled with a small "ServeAI" indicator below them. Inbound messages (provider replies) appear as dark `#262D31` bubbles on the left side.

A "thinking" indicator (three animated dots) appears whenever the AI is composing a response, matching exactly what WhatsApp shows when a contact is typing.

**Human-in-the-loop prompt:** When the AI flags a provider message as requiring user input, a special card appears below the conversation feed. It has a teal left border and a slightly different background `#1A2030`. Inside: a small brain icon on the left, followed by "The provider is asking:" in 12px secondary text, then the provider's question in 14px primary text (bold). Below, a full-width text input with placeholder "Type your answer here..." and a "Send Reply" button in teal. This component is the most important interaction in the entire app — it must be visually distinct from everything else so the user instantly understands they need to do something.

---

### Screen 7: Booking Confirmation / Receipt Screen

**When it appears:** After the AI determines the booking is confirmed (provider has confirmed time, location, and details).

**What appears:** A success animation plays first — a green checkmark draws itself in the center of the screen over 600ms (SVG stroke animation), then expands slightly and contracts back to its final size. The entire screen background briefly pulses with a very subtle teal glow.

Below the animation, the text "Booking Confirmed!" in 24px Plus Jakarta Sans, primary text. Below that in 16px secondary text: "Your request has been sent to [Provider Name]."

A Receipt Card appears with border-radius 14px, background `#1A1D27`, and a teal top border 3px thick (to visually signal it is a document). Inside the card, a header: "Booking Receipt" in 14px secondary text on the left, and the Request ID in JetBrains Mono 12px teal on the right. Then a simple two-column layout: field name on the left in secondary text 12px, field value on the right in primary text 14px. Fields shown: Service (e.g., "Plumbing"), Provider, Location, Scheduled Time, Booked via. At the bottom of the card, a "Download Receipt" button (in MVP, this just triggers the browser print dialog). 

Below the card, two action buttons stacked vertically. The primary button in teal: "Back to Home." The secondary button in ghost style (teal border, transparent background): "View Request History."

---

### Screen 8: Request History Screen

**When it appears:** When the user taps the clock icon in the bottom navigation.

**What appears:** A screen title "Your Requests" in 24px Plus Jakarta Sans. Below it, a filter row with three pill buttons: "All", "Active", "Completed" — tapping each filters the list below.

The list shows one Request Card per past request. Each card shows the service type as a category icon on the left, the provider name and request text truncated to one line in the middle, the status badge on the right (Active in teal, Completed in grey, Cancelled in red), and the date below the status badge. Tapping a card expands it or navigates to the full booking feed for that request, showing the complete conversation history.

---

## Animation and Transition Guidelines

Every screen transition uses a horizontal slide (new screens slide in from the right, back transitions slide out to the right). Duration is 250ms with an ease-out timing function. This matches the native mobile navigation pattern users are already familiar with from their phone's own apps.

The thinking animation shown while the Gemini agent is processing is a row of three dots that fade in and out in sequence, with each dot being 8px, spacing 6px between them, color `#8B95A5`. The sequence delay between each dot is 150ms. This exact animation should be reused anywhere a loading state needs to be shown.

All button tap interactions use a brief scale transform: `transform: scale(0.97)` for 100ms on press, returning to `scale(1.0)` smoothly. This gives tactile feedback even on desktop.

---

## v0.dev Prompt for Generating the Main Screen

When using v0.dev to generate the main chat interface, use this prompt exactly:

"Design a dark-themed AI service booking app main screen. Dark background #0F1117. Primary brand color teal #00C896. Design language: premium fintech meets WhatsApp. At the top, a navigation bar with a small logo on the left and user profile circle on the right. In the main area, show a conversation view with one user message bubble on the right in teal background, and below it an AI response showing three provider result cards. Each card shows a provider name, a star rating, distance in km, and a short explanation. Below the cards, a text input bar at the bottom with a teal send button. Use Plus Jakarta Sans for headings and Inter for body text. The overall aesthetic should feel trustworthy, calm, and sophisticated — like a tool a professional would use."

---

## Responsive Design Rules

ServeAI is primarily a mobile-first web application. All layout decisions are designed for a 390px wide screen (iPhone 14 base width) and must adapt up to 768px for tablet use. Desktop is a bonus, not a requirement for the hackathon.

On mobile, the bottom navigation is 64px and fixed. The input bar is also fixed at the bottom above the navigation. Content scrolls between the top bar and the input bar. On desktop (768px and above), the bottom navigation becomes a left sidebar and the layout becomes a two-column design: the left column shows the sidebar navigation and request history, and the right column shows the main content area. This transformation happens automatically with a single CSS media query breakpoint at 768px.

---

*This document is version 1.0, created May 23, 2026.*
*Update this file whenever a screen is added, removed, or significantly changed during development.*
