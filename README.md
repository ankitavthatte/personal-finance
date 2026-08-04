# Pennywise 💚

A beautiful, private personal-finance app for tracking your everyday expenses — built with React Native (Expo) for iOS and Android.

Pennywise is designed to feel like the best money apps in the world (Copilot Money, Monarch, YNAB): fast to log a purchase, delightful to look at, and genuinely useful at a glance.

<br/>

## Why it looks and works the way it does

Before building, the design was grounded in a study of today's leading personal-finance apps. The patterns that make them great, and how Pennywise adopts each:

| Pattern from the best apps | How Pennywise does it |
| --- | --- |
| **"Free to Spend" hero metric** (Copilot's dashboard leads with the amount you can still spend this month) | The Home screen opens with a large *Free to Spend* number, a monthly progress bar, and a spending **projection** based on your pace so far. |
| **Fast, frictionless entry** | A dedicated **numeric keypad**, one-tap category chips, and smart defaults let you log an expense in a couple of seconds. A prominent floating **+** button is always one tap away. |
| **Color-coded categories with progress bars** | Every category has a curated color and icon. Budgets show live progress bars that turn red when you go over. |
| **Spend-by-category insights** (donut + trends) | The Insights tab renders a **donut breakdown**, a ranked category list, and a **6-month bar trend** — with a month switcher to look back. |
| **Grouped transaction feed** | Activity groups transactions by day with running daily totals, plus search and expense/income filters. |
| **Friendly empty states & onboarding** | Clear calls-to-action instead of blank screens, and a quick, warm onboarding that can seed sample data so the app is useful immediately. |
| **Polished, native feel** | System fonts, soft rounded cards, tactile **haptics** on every meaningful tap, and full **light + dark mode** that follows the device. |
| **Privacy** | All data stays **on-device** (AsyncStorage). No account, no sign-up, no network calls, no tracking. |

## Features

- 🏠 **Dashboard** — Free-to-spend hero, income/expense/net tiles, weekly spending chart, top categories, and recent activity.
- ⚡ **Fast expense entry** — Custom keypad, 15 expense + 6 income categories, notes, and per-day date selection.
- 🧾 **Activity** — Date-grouped feed with search and All / Expenses / Income filters; tap any item to edit or delete.
- 🥧 **Budgets** — Set a monthly cap per category, watch progress fill up, and see what's left (or over) at a glance.
- 📊 **Insights** — Donut breakdown, category ranking, and a 6-month income/expense trend with a month navigator.
- ⚙️ **Settings** — Name, monthly budget, 8 currencies (₹, $, €, £, ¥, and more), load sample data, or reset everything.
- 🌙 **Dark mode** — Automatic, with a palette tuned for both themes.

## Tech stack

- **Expo SDK 52** + **React Native 0.76** (new architecture)
- **Expo Router** — file-based navigation with a custom tab bar and modal routes
- **TypeScript** throughout, in `strict` mode
- **react-native-svg** for the hand-built donut chart (no heavy chart dependency)
- **AsyncStorage** for local persistence via a typed React context + reducer store
- **expo-haptics** for tactile feedback

## Project structure

```
app/                      # Expo Router routes
  _layout.tsx             # Providers + onboarding gate + stack
  onboarding.tsx          # First-run welcome & setup
  add.tsx                 # Add-transaction modal
  settings.tsx            # Settings modal
  transaction/[id].tsx    # Edit-transaction modal
  (tabs)/
    _layout.tsx           # Custom tab bar with floating + button
    index.tsx             # Home / dashboard
    transactions.tsx      # Activity feed
    budgets.tsx           # Budgets
    insights.tsx          # Insights & charts
src/
  theme/                  # Colors, tokens, ThemeProvider (light/dark)
  data/                   # Category catalog & domain types
  store/                  # FinanceStore (persistence) & sample-data seed
  components/             # Reusable UI (Card, charts, keypad, form, …)
  utils/                  # Money/date formatting & analytics selectors
assets/                   # App icon, splash, favicon
```

## Running it

```bash
npm install
npx expo start
```

Then:
- Press **i** for the iOS Simulator, **a** for an Android emulator, or
- Scan the QR code with the **Expo Go** app on your phone.

The project bundles cleanly (`npx expo export --platform ios`) and passes `tsc --noEmit`.

## Data & privacy

Pennywise stores everything locally on your device. There is no backend, no analytics, and no network access. Clearing the app's data (Settings → Reset all data) removes everything permanently.
