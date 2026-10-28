# Calendar 2027 — Interactive Photo & Memory Calendar 📅✨

An interactive, modern monthly calendar web application built with **Next.js 15**, **React 19**, and **TypeScript**. Add custom photo memories and event notes to any day in 2027, switch seasons and themes, install as a full offline-capable **PWA**, and export a printable 12-month PDF.

---

## ✨ Features

- **📸 Interactive Memory Studio**: Select any date in 2027, upload/drag-and-drop a photo, and add event notes with one-click preset tags (🎂 Birthday, ❤️ Anniversary, ✈️ Vacation, 🎉 Party, ⭐ Special, 💼 Meeting).
- **🎨 Modern Glassmorphic Design**: Smooth dark and light mode toggle, curated sunset ember gradients, and fluid micro-animations.
- **📱 Progressive Web App (PWA)**: Installable on Windows, macOS, Android, and iOS with offline support powered by Serwist.
- **📅 12-Month Quick Selector**: Rapid month-strip navigation with seasonal indicators (`❄️ Winter`, `🌱 Spring`, `☀️ Summer`, `🍂 Autumn`) and event indicator dots.
- **⌨️ Keyboard Shortcuts**: Browse months using <kbd>←</kbd> and <kbd>→</kbd> arrow keys.
- **🖨️ High-Res PDF Export**: Instant 12-month A4 landscape export (`/print`) formatted with one page per month.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mradaikal87/PhotoCalender.git

# Enter project directory
cd PhotoCalender

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

---

## 📂 Storage Architecture
- **Photos**: Stored in `public/event/<yyyy-mm-dd>.jpg` (auto-compressed on upload).
- **Notes & Data**: Persisted in `data/events.json`.
- **API**: Next.js App Router handlers at `app/api/events/route.ts`.

---

## 📄 License
MIT
