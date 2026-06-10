# RabbitaAI — Premium UI/UX Design System
### Complete redesign — Apple-inspired, iOS-quality, zero generic AI aesthetics
### Replaces File 03_UI_UX_SPEC.md | Updated May 30, 2026

---

## DESIGN DIRECTION — READ THIS BEFORE WRITING A SINGLE LINE OF CSS

The previous design was competent but generic. This redesign commits fully to one direction: **Apple meets premium fintech, built for Pakistan.**

Think iPhone's Settings app combined with the smoothness of Apple Pay combined with the chat familiarity of iMessage. Every element has breathing room. Every interaction has a physical response. Every screen has exactly one focal point. Nothing competes. Nothing shouts. The app whispers confidence.

The insight behind the visual language: when someone is booking a plumber to come into their home, they need to feel safe. Safety looks like calm, precision, and control — not a loud startup. The app should feel like it was made by a company with decades of experience, even though it launched last week.

**What makes this NOT look AI-generated:**
- Colors are not the default teal-on-dark that every AI app defaults to
- Fonts are chosen for character, not just legibility
- Spacing is generous in unexpected places and tight in expected ones
- Animations feel physical — they have weight and momentum, not just easing curves
- Every screen has a dominant element — one thing the eye goes to first

---

## COLOR SYSTEM — COMPLETE REDESIGN

The previous color system was generic. This one is intentional.

### Background Layers (the depth system)

```css
--layer-0: #07080C;   /* The deepest background — almost black with a hint of blue */
--layer-1: #0E1017;   /* Primary screen background */
--layer-2: #141720;   /* Cards, panels, surface elements */
--layer-3: #1C2030;   /* Elevated cards, dropdowns, active states */
--layer-4: #242840;   /* Highest elevation — modals, tooltips */
```

Why blue-tinted blacks instead of pure black or grey-black: pure black (#000) looks cheap on screens. Blue-tinted near-blacks look like premium OLED displays — exactly what Apple uses. The slight blue undertone also makes the brand accent color feel warmer and more vibrant in contrast.

### Brand Colors

```css
--brand-primary: #3DFFB0;     /* Bright mint-green — electric, modern, fast */
--brand-secondary: #00D68F;   /* Deeper mint for hover states */
--brand-dark: #00A36C;        /* For pressed states */
--brand-glow: rgba(61,255,176,0.15);   /* For glowing backgrounds */
--brand-glow-strong: rgba(61,255,176,0.25); /* For focused inputs */
```

Why this green instead of the old teal: the old #00C896 was safe. #3DFFB0 is the color of something fast and alive — it matches the rabbit symbolism perfectly. It reads as "go", as speed, as energy. On dark backgrounds it pops exactly the way Apple's green notifications pop on dark mode.

### Text Colors

```css
--text-100: #FFFFFF;       /* Pure white — used only for the most important single element on each screen */
--text-90: #F2F4F8;        /* Primary text — headings, important labels */
--text-70: #A8B0C0;        /* Secondary text — subtitles, supporting info */
--text-40: #525A6E;        /* Tertiary — placeholders, disabled states */
--text-inverse: #07080C;   /* Text on bright brand backgrounds */
```

### Semantic Colors

```css
--success: #3DFFB0;     /* Same as brand — success and brand are one message */
--warning: #FFB830;     /* Warm amber — not harsh yellow */
--error: #FF4D6A;       /* Softer red — not aggressive, just clear */
--info: #5B8DEF;        /* Calm blue for informational states */
```

### Special Surface Colors

```css
--glass-bg: rgba(255,255,255,0.04);       /* Frosted glass panels */
--glass-border: rgba(255,255,255,0.08);   /* Glass panel borders */
--divider: rgba(255,255,255,0.06);        /* Subtle dividers */
--overlay: rgba(7,8,12,0.85);            /* Modal overlays */
--whatsapp-header: #1A2E25;             /* Dark WhatsApp green — premium version */
--whatsapp-outbound: #1E3D2F;           /* Outbound bubble background */
--whatsapp-inbound: #1C2030;            /* Inbound bubble background */
```

---

## TYPOGRAPHY SYSTEM — COMPLETELY NEW

**DO NOT use Inter or Plus Jakarta Sans from the old spec.** Both are overused.

### Font Stack

**Display font: `'Clash Display'`** (from Fontshare — free, distinctive)
Used for: app name, hero headings, large numbers
Character: geometric but with personality — feels designed, not defaulted
Import: `@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');`

**Body font: `'Satoshi'`** (from Fontshare — free, premium)
Used for: all body text, labels, buttons, inputs
Character: clean and modern but has more warmth than Inter — feels human
Import: `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap');`

**Mono font: `'JetBrains Mono'`** (Google Fonts)
Used for: Request IDs only
Import standard Google Fonts import

If Fontshare CDN is unavailable as fallback use:
- Clash Display → `'DM Sans'` weight 700
- Satoshi → `'DM Sans'` weight 400/500

### Type Scale

```css
--text-xs:   11px;   /* Captions, timestamps, fine print */
--text-sm:   13px;   /* Secondary labels, badges */
--text-base: 15px;   /* Body text, form inputs, button labels */
--text-md:   17px;   /* Section titles, card headings */
--text-lg:   22px;   /* Screen titles */
--text-xl:   28px;   /* Hero text */
--text-2xl:  36px;   /* App name on login screen */
--text-3xl:  48px;   /* Large decorative numbers */
```

### Line Heights and Letter Spacing

Headings (Clash Display): line-height 1.1, letter-spacing -0.02em (tight — premium)
Body (Satoshi): line-height 1.5, letter-spacing -0.01em
Caps labels: letter-spacing 0.08em, text-transform uppercase, font-size 11px (used for section headers)

---

## SPACING AND LAYOUT

### The Grid

Mobile base: 390px wide (iPhone 14). All padding based on this.
Safe area: 20px left/right gutters. Content lives within these gutters.
Bottom safe area: 34px extra padding for iPhone home indicator.

### Spacing Scale

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius

```css
--radius-sm:   8px;    /* Small chips, badges */
--radius-md:   12px;   /* Inputs, small cards */
--radius-lg:   18px;   /* Main cards */
--radius-xl:   24px;   /* Large containers */
--radius-full: 9999px; /* Pills, circular buttons */
```

---

## ANIMATION AND MOTION — THE APPLE TOUCH

This is what separates a premium app from a generic one. Every interaction must feel physical.

### Timing Functions

```css
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Slight overshoot — feels physical */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);          /* Material smooth */
--ease-out:    cubic-bezier(0, 0, 0.2, 1);             /* Quick deceleration */
--ease-in:     cubic-bezier(0.4, 0, 1, 1);             /* Accelerating */
```

### Core Animations

**Button press:** Scale to 0.96 on mousedown/touchstart, back to 1.0 on mouseup/touchend. Duration 120ms ease-spring. This makes every button feel physically pressable.

**Card tap:** Scale to 0.98, brief shadow reduction, 150ms ease-spring. Feels like pressing a physical card.

**Screen transitions:** Horizontal slide. New screens come from right (translateX from 100% to 0%). Back transitions slide right (translateX from 0% to 30%) while new screen slides in. Duration 320ms ease-out. This matches iOS exactly.

**Loading skeleton:** Gradient shimmer animation sweeping left to right. Background: `linear-gradient(90deg, var(--layer-2) 25%, var(--layer-3) 50%, var(--layer-2) 75%)`. Background-size 200% 100%. Animation: 1.5s infinite linear. This is how iOS shows loading states.

**Confirmation checkmark:** SVG path with stroke-dasharray set to path length. On trigger, stroke-dashoffset animates from full path length to 0. Duration 600ms ease-out. Then scale 1.0 → 1.08 → 1.0 over 300ms for the "pop." Feels alive.

**Provider cards appearing:** Staggered reveal. Each card fades in (opacity 0→1) and slides up (translateY 16px→0). Cards stagger with 80ms delay between each. Duration 400ms ease-out. This is the moment that impresses judges the most — it feels designed.

**Toast notifications:** Slide up from bottom 20px, fade in over 300ms. After 3.5 seconds, slide back down. Spring easing on the way in, ease-in on the way out.

**Input focus:** Border color transitions from glass-border to brand-primary over 200ms. Subtle box-shadow glows: `0 0 0 3px var(--brand-glow)`. This is the Apple focus ring equivalent.

---

## ELEVATION AND SHADOWS

Apple never uses harsh shadows. All shadows are soft, directional, and use color:

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
--shadow-md:  0 4px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3);
--shadow-lg:  0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4);
--shadow-brand: 0 4px 20px rgba(61,255,176,0.2);  /* Brand-colored glow for primary buttons */
```

---

## COMPONENT LIBRARY — EVERY REUSABLE ELEMENT

### Primary Button
```
Height: 52px
Border-radius: var(--radius-full) — fully rounded pill
Background: var(--brand-primary)
Text: var(--text-inverse), Satoshi 500, 15px
Padding: 0 28px
Box-shadow: var(--shadow-brand)
Hover: background var(--brand-secondary), shadow strengthens
Active: scale 0.96, shadow disappears
Disabled: opacity 0.35, no shadow, no hover effects
```

### Secondary Button (Ghost)
```
Height: 52px
Border-radius: var(--radius-full)
Background: transparent
Border: 1.5px solid var(--glass-border)
Text: var(--text-90), Satoshi 500, 15px
Hover: background var(--glass-bg), border-color rgba(255,255,255,0.15)
Active: scale 0.96
```

### Icon Button (circular)
```
Size: 40px × 40px
Border-radius: var(--radius-full)
Background: var(--glass-bg)
Border: 1px solid var(--glass-border)
Icon: 20px, var(--text-70)
Hover: background rgba(255,255,255,0.08)
Active: scale 0.92
```

### Text Input
```
Height: 52px
Border-radius: var(--radius-md)
Background: var(--layer-3)
Border: 1.5px solid var(--glass-border)
Padding: 0 16px
Font: Satoshi 400, 15px, var(--text-90)
Placeholder: var(--text-40)
Focus: border-color var(--brand-primary), box-shadow 0 0 0 3px var(--brand-glow)
Transition: all 200ms ease-smooth
Label: 11px caps, var(--text-70), 8px above input
```

### Card
```
Border-radius: var(--radius-lg)
Background: var(--layer-2)
Border: 1px solid var(--glass-border)
Padding: 16px
Box-shadow: var(--shadow-sm)
Hover (if tappable): background var(--layer-3), border-color rgba(255,255,255,0.12)
Active: scale 0.98
Transition: all 150ms ease-smooth
```

### Status Badge
```
Height: 22px
Padding: 0 10px
Border-radius: var(--radius-full)
Font: Satoshi 500, 11px, uppercase, letter-spacing 0.04em
Active: background rgba(61,255,176,0.15), color var(--brand-primary), border 1px solid rgba(61,255,176,0.3)
Confirmed: background rgba(168,176,192,0.1), color var(--text-70)
Cancelled: background rgba(255,77,106,0.1), color var(--error)
```

### Bottom Navigation Bar
```
Height: 64px + bottom safe area
Background: var(--layer-1) with backdrop-filter: blur(20px)
Border-top: 1px solid var(--divider)
Three items evenly distributed
Each item: icon (24px) above label (10px Satoshi 500 caps)
Inactive: icon and label var(--text-40)
Active: icon var(--brand-primary), label var(--brand-primary)
Active indicator: small 4px × 4px circle below icon in brand color
Transition: color 150ms ease-smooth
```

### Toast Notification
```
Max-width: 320px
Margin: auto + 20px from bottom (above nav bar)
Background: var(--layer-4)
Border: 1px solid var(--glass-border)
Border-radius: var(--radius-lg)
Padding: 12px 16px
Box-shadow: var(--shadow-lg)
Icon left (16px), text right in Satoshi 400 13px var(--text-90)
Success icon: checkmark in brand color
Error icon: X in error color
```

---

## SCREEN SPECIFICATIONS — EVERY SCREEN IN DETAIL

---

### SCREEN 1: SPLASH SCREEN
Duration: 1.2 seconds while Firebase initializes

**Background:** var(--layer-0) — the deepest black

**Center element:**
The RabbitaAI logomark: a stylized rabbit silhouette made of two overlapping rounded rectangles (the ears) above a circle (the head), rendered as a single SVG path. Size: 56px × 56px. Color: var(--brand-primary). Surrounding the logo: a soft radial glow — `radial-gradient(circle at center, var(--brand-glow-strong) 0%, transparent 70%)` at 120px × 120px.

Below logo: "RabbitaAI" in Clash Display 700, 24px, var(--text-90). Letter-spacing -0.02em.

Below name: three dots in brand color, pulsing in sequence (not bouncing — just opacity 1.0 → 0.3 → 1.0, 400ms per dot, staggered 150ms). This is calmer and more premium than bouncing dots.

**Transition out:** The entire splash fades (opacity 1→0) over 400ms simultaneously as the login screen fades in. They crossfade — nothing slides.

---

### SCREEN 2: LOGIN SCREEN

**Background:** var(--layer-1). Behind everything, a very subtle radial gradient from center: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(61,255,176,0.04) 0%, transparent 100%)`. This is invisible at first glance but adds dimensionality — exactly how Apple adds subtle gradients to dark mode screens.

**Layout:** Single centered column, max-width 360px, vertically centered with slight upward bias (45% from top rather than 50%).

**Top section — brand:**
The rabbit logomark SVG, 48px, in brand color, with a 64px × 64px rounded square (radius 20px) background in `rgba(61,255,176,0.1)`. This is the logo container — like an app icon.
Below: "RabbitaAI" in Clash Display 700, 32px, var(--text-100). Letter-spacing -0.03em.
Below: "Fast connections. Any service." in Satoshi 400, 15px, var(--text-70). Letter-spacing -0.01em.

**Spacer:** 48px

**Bottom card section:**
A glass card: background `rgba(14,16,23,0.8)`, border `1px solid var(--glass-border)`, border-radius var(--radius-xl), padding 28px. Backdrop-filter: blur(20px). This frosted glass card is the Apple touch — it feels like it belongs on iOS.

Inside the card:
- "Welcome" in Clash Display 600, 22px, var(--text-100)
- "Sign in to get started" in Satoshi 400, 14px, var(--text-70). Margin-bottom 24px.

**Google Sign-In button:**
Full width. Height 52px. Background: var(--layer-3). Border: 1px solid var(--glass-border). Border-radius var(--radius-md).
Left: Google logo SVG (official colors, 20px). Center: "Continue with Google" in Satoshi 500, 15px, var(--text-90). Right: arrow icon (→) in var(--text-40).
Hover: background var(--layer-4), border-color rgba(255,255,255,0.15). The arrow shifts 2px right on hover.
Active: scale 0.97, 120ms spring.

**Fine print below card:** "Secure sign-in powered by Google" in Satoshi 400, 11px, var(--text-40). Centered. A small lock icon SVG (10px) before the text.

**Entry animation:** Card slides up from translateY(24px) to translateY(0) and fades in over 500ms ease-out. Brand section fades in first (0ms delay), card follows (150ms delay). This staggered entry feels intentional.

---

### SCREEN 3: PROFILE SETUP SCREEN

**Header:**
Back arrow left (icon button), "Set up your profile" center in Clash Display 600 22px var(--text-100), nothing right.
Below header: two-dot progress indicator. Dot 1: 8px filled brand color. Dot 2: 8px filled var(--layer-3). Between them: 40px line in var(--layer-3). Active dot has `box-shadow: 0 0 8px var(--brand-primary)` — a glow.

**Step 1 — Basic Info:**

Section label above each group: 11px caps Satoshi 500, var(--text-40), letter-spacing 0.08em. Example: "YOUR NAME", "PHONE NUMBER", "YOUR AREA".

Name input: pre-filled from Google. Has a small Google G icon inside right side indicating it came from Google.

Phone input: the +92 prefix is a separate pill element: background var(--layer-4), border-right 1px solid var(--glass-border), padding 0 12px, Satoshi 500 15px var(--text-70). The input field starts after this pill. Pakistani flag emoji before "+92".

Area input: has a location pin icon button on the right (tappable to request geolocation). Icon pulses once when tapped to show it's working.

Between Step 1 and Step 2 transition: the Step 1 fields slide left and fade out (translateX 0 → -30px, opacity 1→0, 250ms), then Step 2 slides in from right (translateX 30px→0, opacity 0→1, 250ms). Smooth page-within-page transition.

**Step 2 — Preferences:**

**Radius slider:** Custom styled. Track: 4px height, background var(--layer-3), border-radius 2px. Filled portion: brand color gradient. Thumb: 24px circle, background var(--brand-primary), box-shadow var(--shadow-brand). Value shown in a floating badge above thumb: "5 km" in Satoshi 600 13px var(--text-inverse) on brand background, border-radius var(--radius-full), padding 3px 8px. Badge position follows thumb smoothly.

**Price range:** Three pill toggle buttons in a row. Each: height 36px, border-radius var(--radius-full), Satoshi 500 13px. Unselected: background var(--layer-3), border 1px solid var(--glass-border), text var(--text-70). Selected: background var(--brand-glow), border 1px solid var(--brand-primary), text var(--brand-primary). Transition: all 200ms ease-smooth. The selected state feels like it lights up.

**Rating:** 5 star icons. Tapping any star fills all stars up to and including that one in brand color. Stars before the threshold are var(--brand-primary). Stars after are var(--layer-3). Each star scale-pops on select (scale 1.0 → 1.3 → 1.0 over 200ms spring). Feels rewarding to tap.

**Save button:** Primary button style, full width, "Let's go →" text. Not "Save and Continue" — that's corporate. "Let's go →" is human and matches the brand energy.

---

### SCREEN 4: HOME SCREEN (MAIN)

**Header (56px):**
Left: "RabbitaAI" logo small (20px) + wordmark in Clash Display 600 16px var(--text-90).
Right: Profile photo circle (32px, border 2px solid var(--layer-3)). If no photo: initials on brand color background.
Bottom border: 1px var(--divider). Header has `backdrop-filter: blur(16px)` and background `rgba(14,16,23,0.9)` — it's transparent enough to see content scrolling behind it, exactly like iOS navigation bars.

**Empty state (no requests yet):**
Vertically centered in the content area.
Large rabbit emoji (or logo SVG) at 64px with a subtle floating animation (translateY 0px → -6px → 0px, 3s ease-in-out infinite). This one small animation makes the app feel alive.
"What do you need today?" in Clash Display 600, 24px, var(--text-90). Centered.
"Find a plumber, order pizza, book a cleaner — just type it." in Satoshi 400, 14px, var(--text-70). Centered. Max-width 260px.
Below: three suggestion chips in a row:
Each chip: height 32px, padding 0 14px, border-radius var(--radius-full), background var(--glass-bg), border 1px solid var(--glass-border), Satoshi 500 13px var(--text-70). Text examples: "🔧 Plumber", "🍕 Pizza", "⚡ Electrician". Tapping pre-fills the input.

**Chat conversation area:**
Scrollable. Padding 16px horizontal.

User messages: Right-aligned. Background var(--brand-glow), border 1px solid rgba(61,255,176,0.2), border-radius 18px 18px 4px 18px. Padding 10px 14px. Satoshi 400 15px var(--text-90). Max-width 80%. Timestamp below in 11px var(--text-40).

AI messages: Left-aligned. Background var(--layer-2), border 1px solid var(--glass-border), border-radius 18px 18px 18px 4px. Padding 10px 14px. Satoshi 400 15px var(--text-90). Max-width 85%. Small rabbit logo (16px) appears to the left of AI bubbles.

Thinking animation: Three dots inside an AI message bubble. Dots are 6px circles in var(--text-40). Opacity pulses 0.3→1.0→0.3 in sequence. Feels exactly like iMessage "typing..."

**Provider cards appearing inside chat:**
The AI bubble first shows: "Found 3 options near you 📍" then below it the cards appear staggered.

Each provider card inside the chat (slightly different from standalone card):
Full width minus 16px margin. Background var(--layer-2). Border 1px solid var(--glass-border). Border-radius var(--radius-lg). Padding 14px.
Left column (48px): Category emoji in a 40px rounded square (background var(--glass-bg)).
Center column (flex-grow): Name Satoshi 600 15px var(--text-100). aiExplanation Satoshi 400 12px var(--text-70). Distance in brand color with location pin icon: "📍 1.2 km".
Right column: Star rating (⭐ Satoshi 600 13px). Arrow chevron (→) in var(--text-40).
On tap: card border becomes brand color, background shifts to var(--brand-glow-strong), arrow becomes brand color. A "Book this →" button slides in from the bottom of the card over 200ms.

**Input bar (fixed bottom, above nav):**
Container: height 64px, padding 8px 16px, background `rgba(14,16,23,0.95)`, border-top 1px solid var(--divider), backdrop-filter blur(20px).
Inside: a pill-shaped input container: background var(--layer-3), border 1px solid var(--glass-border), border-radius var(--radius-full), height 44px.
Left: microphone icon 20px var(--text-40) (disabled for MVP, shows "coming soon" tooltip on tap).
Center: text input, Satoshi 400 15px, no border, transparent background, placeholder var(--text-40).
Right: send button — 36px circle, background var(--brand-primary) when active/has text, background var(--layer-4) when empty. Arrow icon (↑) 18px. Brand glow shadow when active. Scale press animation on send. This button is the most important interactive element in the app — make it feel incredible to tap.

When input is focused: the entire input container border glows brand color. The keyboard appears (handled by browser). Content area scrolls up automatically. Input bar sticks above keyboard.

---

### SCREEN 5: PROVIDER SELECTION (full screen)

Triggered when user taps "Book this →" on a provider card. Slides up from bottom as a modal sheet (not a full screen nav — it slides up like iOS sheets).

**Sheet handle:** 4px × 36px rounded pill at top center, color var(--layer-4). User can drag down to dismiss.

**Header inside sheet:** Provider name in Clash Display 600 20px var(--text-100). Category + distance below in Satoshi 400 13px var(--text-70).

**Provider details card:**
Rating displayed large: star icon in warning color + "4.7" in Clash Display 700 36px var(--text-100). "Based on Google reviews" in 11px var(--text-40) below.
Address with pin icon.
Phone number (if available) — shown as tappable but note: "We'll contact them on your behalf" below it in 11px var(--text-40). User's number privacy is made visible.

**Two action buttons:**
Primary: "Book via WhatsApp →" full width, primary button style. The WhatsApp logo (SVG, white) appears left of text.
Secondary: "← See other options" ghost button.

**Privacy note:** Small card at bottom with a lock icon: "Your address and phone are only shared with your explicit permission." 12px Satoshi 400 var(--text-70). This is a trust builder.

---

### SCREEN 6: LIVE BOOKING FEED

**Header:** Background var(--whatsapp-header). Height 60px. Left: back arrow. Center: provider name Satoshi 600 16px white + "via WhatsApp" 11px rgba(255,255,255,0.7) below. Right: the Request ID in monospace 11px rgba(255,255,255,0.5) — small but visible. A pulsing green dot (4px circle, brand color, opacity 1→0.3→1, 1.5s infinite) to the left of provider name to show live status.

**Conversation area:**
Outbound messages (sent by RabbitaAI AI on user's behalf): background var(--whatsapp-outbound). Border-radius 18px 18px 4px 18px. Below: "Sent by RabbitaAI" in 10px var(--text-40) italic.
Inbound messages (provider replies): background var(--whatsapp-inbound). Border-radius 18px 18px 18px 4px.
Timestamps between message groups: centered, 10px Satoshi 400 var(--text-40), e.g., "Just now."

**Status updates (system messages):**
Centered pills: "✓ Message delivered", "⏳ Waiting for reply..." in 11px Satoshi 500, background var(--glass-bg), border 1px solid var(--glass-border), border-radius var(--radius-full), padding 4px 12px. These punctuate the conversation like iMessage delivery receipts.

**Human-in-the-loop card:**
This is the most important UI moment in the app. When the AI needs user input, a card slides up from the bottom of the conversation area (spring animation, 300ms) with:
Background: `linear-gradient(135deg, var(--layer-3), var(--layer-4))`. Border: 1px solid var(--brand-primary) at 40% opacity. Border-radius var(--radius-lg). Left border: 3px solid var(--brand-primary).
Top: small label "YOUR INPUT NEEDED" in 10px caps Satoshi 500 var(--brand-primary).
Below: "The provider is asking:" in 12px var(--text-70).
Below: The provider's question in Satoshi 500 15px var(--text-100).
Below: text input (standard input style).
Below: "Send Reply" primary button (full width, smaller — 44px height).
The card has a subtle brand glow: `box-shadow: 0 0 32px rgba(61,255,176,0.1)`. This draws the eye without being aggressive.

**Progress timeline (right sidebar on wider screens, bottom sheet on mobile):**
Shows the current booking step: 1. Request sent ✓  2. Provider replied ✓  3. Details confirmed...  4. Booking confirmed
Each step: small circle (8px) in brand color if done, var(--layer-3) if pending. Connected by a thin line.

---

### SCREEN 7: BOOKING CONFIRMATION / RECEIPT

**Entry animation sequence (choreographed — this is the money moment):**
1. Screen fades in (300ms)
2. After 100ms: a circular success indicator scales from 0 to 1.0 with spring overshoot (scale 0 → 1.12 → 1.0, 500ms spring). Circle: 80px diameter, border 3px solid var(--brand-primary), box-shadow var(--shadow-brand).
3. Inside circle: checkmark SVG draws itself (stroke-dashoffset animation, 400ms ease-out, starts 200ms after circle appears)
4. After checkmark completes (600ms): confetti particles burst from the circle center. 12 small particles (4px circles and 6px squares) in brand color and white, shooting outward with random angles, fading as they travel. Duration 800ms. This is the celebration moment — it makes the user feel their booking actually happened.
5. Text fades in from below (opacity 0→1, translateY 12px→0, 400ms, starts at 700ms)

**Confirmation text:**
"Booked!" in Clash Display 700 36px var(--text-100). Below: Provider name in Clash Display 600 20px var(--brand-primary). Below: Scheduled time in Satoshi 400 15px var(--text-70).

**Receipt card:**
Background var(--layer-2). Border-top: 3px solid var(--brand-primary). Border-radius var(--radius-lg). Padding 20px.
Header row: "Booking Receipt" in 11px caps Satoshi 500 var(--text-40) left, Request ID in JetBrains Mono 11px var(--brand-primary) right.
Divider line (1px var(--divider)).
Fields in two-column layout (label left var(--text-40) 12px, value right var(--text-90) 14px Satoshi 500):
- Service
- Provider
- Time
- Location
- Booked via (shows WhatsApp logo + "WhatsApp")
- Booked at (timestamp)

**Actions:**
"Back to Home" primary button.
"Share Receipt" secondary button with share icon. (For MVP this copies receipt text to clipboard.)

---

### SCREEN 8: HISTORY SCREEN

**Header:** "Your Bookings" in Clash Display 600 24px var(--text-100).

**Filter pills:** "All" / "Active" / "Completed" / "Cancelled" — scrollable horizontal row. Selected pill: background var(--brand-glow), border brand color, text brand color. Others: ghost style.

**Request list:**
Each item: Card style. Left: category emoji in 40px rounded square (background matches category — plumber=blue tint, food=orange tint, electrical=yellow tint, etc.). Center: service type Satoshi 600 15px var(--text-90) top, truncated original request Satoshi 400 13px var(--text-70) bottom. Right: status badge top, date 11px var(--text-40) bottom. Chevron → far right.
Tap: navigates to that booking's feed/history.

**Empty state:** Rabbit logo floating animation, "No bookings yet" Clash Display 600 20px var(--text-70), "Your booking history will appear here" Satoshi 400 13px var(--text-40).

---

## REFERENCE INSPIRATIONS — SHOW THESE TO THE AI

When prompting Antigravity or any AI for UI generation, include these references:

1. **Apple Maps dark mode** — how information density and color work together
2. **Apple Pay confirmation screen** — the success animation style to copy
3. **Apple Messages dark mode** — exactly the chat bubble treatment to replicate for the booking feed
4. **Revolut app** — dark fintech card design, how they handle financial confirmations
5. **Linear app** — how a dark productivity app can feel premium and focused
6. **Craft app** — elegant use of white space and typography in dark mode

Tell the AI: "Design language: Apple Maps dark mode meets WhatsApp chat meets Revolut payment confirmation. Every screen has generous spacing, exactly one visual focal point, and all interactive elements respond physically to touch."

---

## ANTIGRAVITY PROMPT TEMPLATE

When using Antigravity with Opus for UI generation, start every prompt with:

> "You are designing a premium iOS-quality mobile web app called RabbitaAI. Design language: Apple dark mode (think Apple Maps, Apple Pay, iMessage) meets premium Pakistani fintech. The app books local services via WhatsApp AI.
>
> MANDATORY rules:
> - Background: #07080C (deepest) and #0E1017 (screens) — NOT #000 and NOT grey
> - Brand accent: #3DFFB0 (bright mint-green) — represents speed (rabbit) and connection
> - Fonts: Clash Display for headings, Satoshi for body — import from Fontshare
> - All corners generously rounded (18-24px on cards)
> - Every interactive element has a physical press animation (scale 0.96-0.98)
> - Spacing is generous — minimum 20px gutters, minimum 16px between elements
> - Glass morphism for overlapping surfaces (backdrop-filter: blur + semi-transparent bg)
> - NO purple gradients, NO generic teal-on-dark, NO Inter font, NO boring card layouts
> - This must look like it belongs on the App Store's featured section"

Then describe the specific screen. This prompt context guarantees the output won't look like default AI UI.

---

## WHAT MAKES THIS NOT LOOK AI-GENERATED — CHECKLIST

Before shipping any screen, check every item:

- [ ] Does the background have dimension (subtle gradient or glow) or is it flat solid?
- [ ] Is there exactly ONE element the eye goes to first on this screen?
- [ ] Do all buttons have a physical press animation?
- [ ] Are fonts Clash Display + Satoshi (not Inter, not Roboto, not system-ui)?
- [ ] Is the brand color #3DFFB0 (not a generic teal)?
- [ ] Do cards have glass borders (rgba white) not solid grey borders?
- [ ] Is spacing consistent with the 4px scale system?
- [ ] Do loading states use shimmer animation (not a spinner)?
- [ ] Are screen transitions directional slides (not fades)?
- [ ] Does the most important action on each screen have a brand color glow shadow?

If any item is unchecked, fix it before moving on.

---

*RabbitaAI Design System v2.0 — Updated May 30, 2026*
*"Design is not how it looks. Design is how it feels." — Jony Ive*
