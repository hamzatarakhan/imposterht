

## Setting Up PWA (Progressive Web App)

This plan will make your Imposter game installable on phones and tablets. Users will be able to add it to their home screen and use it like a regular app - even when offline!

---

### What You'll Get

- **Install Button**: Users can "Add to Home Screen" on iOS and Android
- **App-like Experience**: Full screen mode, no browser bars
- **Works Offline**: Game will work even without internet
- **App Icon**: Custom icon on the home screen

---

### Implementation Steps

#### Step 1: Create Web App Manifest
Create a `manifest.json` file in the `public` folder with app information:
- App name: "Imposter"
- Arabic description
- Theme colors matching the dark purple theme (#0f0a1a)
- Icons for different screen sizes
- Display mode: standalone (full screen, no browser UI)
- RTL text direction

#### Step 2: Create Service Worker
Create a `sw.js` file in the `public` folder to:
- Cache all app files for offline use
- Handle network requests when offline
- Update cache when new version is available

#### Step 3: Update HTML
Add to `index.html`:
- Link to manifest file
- Apple-specific meta tags for iOS support
- Mobile web app capable meta tags

#### Step 4: Register Service Worker
Update `src/main.tsx` to register the service worker when the app loads

---

### Technical Details

**Files to Create:**
1. `public/manifest.json` - PWA configuration
2. `public/sw.js` - Service worker for offline support

**Files to Modify:**
1. `index.html` - Add manifest link and iOS meta tags
2. `src/main.tsx` - Register service worker

**Manifest Configuration:**
```text
+---------------------------+
|  manifest.json            |
+---------------------------+
| name: "Imposter"          |
| short_name: "Imposter"    |
| start_url: "/"            |
| display: "standalone"     |
| background: "#0f0a1a"     |
| theme_color: "#0f0a1a"    |
| dir: "rtl"                |
| lang: "ar"                |
| icons: [192x192, 512x512] |
+---------------------------+
```

**Service Worker Strategy:**
- Cache-first for static assets (JS, CSS, images)
- Network-first for dynamic content
- Fallback to cached version when offline

---

### How Users Will Install

**On Android (Chrome):**
1. Visit the app URL
2. Tap the 3-dot menu
3. Select "Add to Home screen"
4. Or use the automatic install prompt

**On iOS (Safari):**
1. Visit the app URL
2. Tap the Share button
3. Select "Add to Home Screen"

---

### Notes

- The app will use the existing `favicon.png` as the app icon
- For best results, you may want to create larger icon sizes (192x192 and 512x512) later
- The offline functionality will cache the game so it works without internet

