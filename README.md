# MUSE
> **See the world differently.**  
> *An AI that needs you to stop looking at it.*

[![CI](https://github.com/placeholder/muse/actions/workflows/ci.yml/badge.svg)](https://github.com/placeholder/muse/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Touch%20Grass-10b981.svg)](https://hacktoberfest.com)

---

## 1. What is MUSE?

**MUSE** is an AI-powered real-world scavenger hunt application built with **React Native / Expo** and **Gemma 4**.

Instead of serving as a chat assistant or indoor screen-time sink, MUSE generates contextual observation challenges that require players to put down their phones, inspect physical surroundings on a university campus or city park, discover matching real-world objects, and capture them with their phone camera.

```text
Open MUSE ──▶ Receive Mission ──▶ Put Phone Away ──▶ Explore Physical World
                                                               │
Expedition Summary ◀── Next Chained Mission ◀── Gemma 4 Verification ◀┘
```

The central philosophy:
> **The AI interaction should be short; the real-world interaction should be long.**

---

## 2. Why Gemma 4?

1. **Multimodal Visual Verification**: Gemma 4 interprets camera images directly to verify whether complex semantic relationships are met (e.g., verifying that a safety railing counts as "something that protects people").
2. **Context-Aware Dynamic Chaining**: Unlike static trivia, Gemma synthesizes the next mission based on the player's previous real-world discovery.
3. **Open-Weight Autonomy**: Open weights provide complete architectural freedom—allowing on-device execution with LiteRT-LM / Google AI Edge alongside cloud API fallback.
4. **Purpose-Driven AI**: The AI is the game board verification engine, not an ornamental chatbot.

---

## 3. Core Architecture

MUSE abstracts inference behind an interchangeable provider interface:

```text
                      ┌──────────────────────┐
                      │  AIProviderManager   │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ GemmaLocalProvider│    │ GemmaAPIProvider │    │ FallbackProvider │
│   (Gemma 4 E2B   │    │  (Multimodal API │    │  (Touch Grass    │
│    On-Device)    │    │     Endpoint)    │    │  Offline Engine) │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

- **GemmaLocalProvider**: Prepared for on-device edge execution using Google AI Edge / LiteRT-LM.
- **GemmaAPIProvider**: Connects to the multimodal Google Generative Language API using `EXPO_PUBLIC_GEMMA_API_KEY`.
- **FallbackProvider**: Zero-config offline simulation provider that ensures 100% playable demos even in basements without cellular connection.

---

## 4. Key Features

- **Field HUD Design**: Minimal dark-tech tactical interface calibrated with an Obsidian & Emerald Phosphor palette.
- **Dynamic Difficulty Progression**:
  - **Level 1 (50 XP)**: Visual attributes (colors, geometric shapes, raw materials).
  - **Level 2 (100 XP)**: Functional relationships (protection, guidance, reflection).
  - **Level 3 (150 XP)**: Abstract concepts (mimicking nature, structural age, movement).
- **Discovery Chain**: Visualizes the interconnected sequence of discoveries (e.g. Tree → Railing → Window → Sign).
- **Local Persistence**: Tracks active expeditions and lifetime XP in `AsyncStorage`.
- **Camera Viewfinder**: Real-time crosshair HUD overlay, instant retake/confirm loop, and web upload fallback.

---

## 5. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 22)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/placeholder/muse.git
cd muse

# Install dependencies
npm install
```

### Environment Configuration (Optional)
To enable remote multimodal Gemma inference, set your API key in an `.env` file or export it:

```bash
EXPO_PUBLIC_GEMMA_API_KEY="your-google-ai-api-key"
```

*Note: You can also enter the API key directly within the app under `⚙ TELEMETRY`.*

### Running the App

```bash
# Start development server
npx expo start

# Run in Web browser
npm run web

# Run on Android emulator / device
npm run android

# Run on iOS simulator
npm run ios
```

---

## 6. Running Tests

```bash
# Run unit test suite (XP calculation, mission parsing, state, AI fallbacks)
npm test

# Run TypeScript type check
npm run typecheck
```

---

## 7. Safety Directives

MUSE missions are programmatically filtered to prevent dangerous instructions. Challenges:
- Never require entering restricted or private property.
- Never require climbing, crossing dangerous roads, or approaching wildlife.
- Never require interacting with strangers or purchasing items.

---

## 8. License

This project is open-source under the [MIT License](LICENSE).
