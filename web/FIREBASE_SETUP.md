# Pennywise Household — Firebase setup (one time, ~5 minutes)

Pennywise Household keeps both phones in sync using **your own free Firebase project**.
Your expenses live only in your project — no one else can see them.

Do this once, on any computer or phone. Then both of you use the same config.

## 1. Create a Firebase project
1. Go to **https://console.firebase.google.com** and sign in with a Google account.
2. Click **Add project** → give it a name (e.g. *Pennywise*) → you can disable Google Analytics → **Create project**.

## 2. Turn on the database
1. In the left menu: **Build → Firestore Database → Create database**.
2. Choose a location near you → start in **Production mode** → **Enable**.
3. Open the **Rules** tab, replace everything with the rules below, and click **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{hid} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 3. Turn on sign-in
1. **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab → click **Anonymous** → **Enable** → **Save**.

## 4. Get your config
1. Click the **⚙ gear → Project settings**.
2. Scroll to **Your apps** → click the **web icon `</>`** → register the app (any nickname) → **Register app**.
3. Firebase shows a `firebaseConfig = { ... }` block. **Copy the whole `{ ... }` object.**

## 5. Connect the app
1. Open **pennywise.html** (the app file) in Safari or Chrome on your phone.
2. Paste the `firebaseConfig` object → tap **Connect**.
3. Tap **Create**, name your household, enter your name → **Create household**.
4. You'll get an **invite code** (Settings → Household). Share it with your partner.

## 6. Your partner joins
1. They open **the same pennywise.html** in their browser.
2. They paste the **same** `firebaseConfig` → **Connect**.
3. They tap **Join**, enter the **invite code** and their name → **Join household**.

That's it — every expense either of you adds now shows up on both phones, with "who added it".

---

### Notes
- The `firebaseConfig` values (including `apiKey`) are **not secrets** — they're safe to share between the two of you and to keep in the app. Access is controlled by the sign-in + rules above.
- Anyone who has both your `firebaseConfig` **and** your household invite code could join your household, so keep the code between the two of you. You can start a fresh household anytime (Settings → Leave household).
- Free tier limits are generous (far beyond a couple's daily expenses). If you ever outgrow a single document, the ledger can be migrated to per-transaction records — ask and it can be upgraded.
