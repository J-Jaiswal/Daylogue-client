# Daylogue 🌌

Daylogue is a cinematic, conscious self-reflection application designed to help individuals gain deep awareness of their daily habits, physical efforts, and lifestyle trajectory. 

---

## 🧠 App Philosophy

Daylogue is built on the belief that **you cannot optimize what you do not observe**. 

Most trackers treat health as a series of isolated spreadsheets—step counts, caloric numbers, heart rate variability. This micro-management leads to "tracker fatigue." Daylogue takes a different path: **mindful awareness**. It is designed to act as a **mirror**, not a spreadsheet. By prompting you to check in with just three critical daily signals—Sleep, Physical Effort, and Nutrition—it provides a clear reflection of how your daily actions align with who you want to become.

---

## 🎯 What Problem It Resolves

1. **Tracker Fatigue & Abandonment**: Most fitness apps ask for granular logs (exact food weights, exercise sets, water intake), which users eventually abandon. Daylogue simplifies logging down to under **one minute a day**.
2. **Disconnected Data**: Classic trackers tell you *what* happened but not *how it affects you*. Daylogue aggregates sleep, workout fulfillment, and nutritional quality into a single, deterministic **Daily Performance Score**, giving you an immediate sense of daily wellness momentum.
3. **Generic AI Coaching**: Typical health advice is static and generic. Daylogue's AI Coaching takes into account your **Current Life Phase** (e.g., Strength, Balance, Recomp, Peak) and your **Life Context** (e.g., Working Professional, Student, Off Season) alongside your last 14 days of logs, delivering advice tailored specifically to your active season.

---

## ⚙️ How It Functions

1. **Phase Setup**: When you first set up your profile, you choose your primary goal phase and your current life context. This shapes the context through which the AI interprets your habits.
2. **Daily Signals Check-In**:
   - **Sleep**: Log your bed time and wake time (determines total sleep duration).
   - **Training**: Log training sessions and exercises completed.
   - **Nutrition**: Log meals and label them (such as Breakfast, Dinner, or Cheat Meal).
3. **Daily Performance Score**: A rule-based utility runs instantly in the client browser, parsing your logs to calculate a score out of 100:
   - *Sleep (Max 35 points)*: Evaluates if sleep duration is within the 7–9 hour ideal window.
   - *Workout (Max 30 points)*: Rewards you based on sessions completed.
   - *Nutrition (Max 25 points)*: Scores meal regularity, with deductions for junk food or cheat meals.
   - *Completeness (Max 10 points)*: Incentivizes logging all three pillars.
4. **Contextual AI Coach**: The backend AI evaluates your active profile contexts, goals, and historic log patterns, then delivers actionable, direct feedback.
5. **Timeline Mirror**: The History tab scrolls through 90 days of logs inline with color-coded score badges, using custom filters to highlight exactly when you slept well, missed logs, or trained.

---

## 🛠️ Technical Overview of the Codebase

The frontend is a modern **React 19** Single Page Application (SPA) bundled using **Vite**. The codebase is structured for quick rendering, offline calculation utility, and clean separation of concerns:

### 1. State Management & Data Fetching
- **TanStack React Query (`@tanstack/react-query`)**: Manages cache synchronization for server data. Key queries include:
  - `todayLog`: Keeps track of today's checks.
  - `logs-range`: Fetches logs for history ranges, avoiding redundant queries.
  - `phase-history`: Manages active user goal history.
- **React Context (`useAuth`)**: Handles session authentication state. Stores JWT tokens and active user profile details, persisting auth tokens across refreshes.

### 2. Styling & Design Token Architecture
- **Vanilla CSS (Variables-driven)**: Styled without TailwindCSS to allow maximum layout control. Core styles are defined globally in [base.css](file:///c:/Users/jayes/OneDrive/Desktop/Daylogue/client/src/styles/base.css) and overwritten via selectors like `[data-theme="light"]` for theme switching.
- **Cinematic Glassmorphism**: Cards use `backdrop-filter: blur(20px)` and subtle glowing borders (`box-shadow: 0 0 0 1px rgba(124, 92, 252, 0.3)`) to emulate space cockpit HUD aesthetics.

### 3. Client-Side Formula Execution
- **`src/utils/scoreUtils.js`**: Houses the mathematical rules of the daily wellbeing score. Being a pure function, it executes instantly and works offline, ensuring the user gets feedback immediately upon saving inputs without waiting for database operations.

### 4. Codebase Directory Mapping
```
client/
├── src/
│   ├── api/                # Axios API handlers (communication with backend)
│   │   ├── authApi.js
│   │   ├── logApi.js
│   │   └── profileApi.js
│   ├── components/         # Modular React views
│   │   ├── common/         # Layout wrapper & Theme-toggle Navbar
│   │   ├── history/        # DayLogCard & DayLogList (timeline scrolls & pills filters)
│   │   ├── home/           # PerformanceScore widget (SVG circle ring), status cards
│   │   └── log/            # Custom styled inputs (SleepForm, WorkoutForm, MealForm)
│   ├── hooks/              # Custom query integrations (useAuth, useTodayLog)
│   ├── pages/              # Main router entry layouts (HomePage, ProfilePage, LogPage)
│   ├── styles/             # Specific CSS namespaces (profile.css, log.css, home.css)
│   └── utils/              # scoreUtils & dateUtils formulas
├── vite.config.js          # Hot Module Replacement (HMR) configurations
└── package.json            # Client packages & scripts manifest
```

---

## 🚀 Dev Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root of the client directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173/` or `http://localhost:5174/`.
