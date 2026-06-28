export const DUMMY_TOKEN = "dummy-auth-token";

export const DUMMY_USER = {
  id: "dummy-user",
  name: "Dummy User",
  email: "dummy@daylogue.local",
  age: 25,
  weight: 70,
  height: 175,
  goals: "Build a consistent routine around sleep, training, and simple meals.",
  currentPhase: {
    primaryGoal: "maintaining",
    lifeContext: "working_professional",
    startDate: "2026-06-01T00:00:00.000Z",
  },
};

const suggestions = [
  { category: "sleep", suggestion: "Keep bedtime within a 45 minute range." },
  { category: "workout", suggestion: "Use two lighter sessions to stay fresh." },
  { category: "diet", suggestion: "Pair each meal with a simple protein source." },
];

export const DUMMY_LOGS = [
  {
    date: "2026-06-01",
    sleep: { bedTime: "23:15", wakeTime: "06:45", durationMinutes: 450 },
    workouts: [
      {
        timeOfDay: "evening",
        exercises: [
          { name: "Squat", type: "sets_reps", sets: 4, reps: 6 },
          { name: "Walking", type: "duration", durationMinutes: 20 },
        ],
      },
    ],
    meals: [
      { category: "breakfast", items: [{ name: "Oats", amount: "1 bowl" }] },
      { category: "dinner", items: [{ name: "Paneer rice", amount: "1 plate" }] },
    ],
    aiDailySuggestion: JSON.stringify(suggestions),
  },
  {
    date: "2026-06-02",
    sleep: { bedTime: "23:40", wakeTime: "07:10", durationMinutes: 450 },
    workouts: [],
    meals: [
      { category: "lunch", items: [{ name: "Dal rice", amount: "1 plate" }] },
      { category: "snacks", items: [{ name: "Fruit", amount: "2 pieces" }] },
    ],
  },
  {
    date: "2026-06-03",
    sleep: { bedTime: "22:55", wakeTime: "06:30", durationMinutes: 455 },
    workouts: [
      {
        timeOfDay: "morning",
        exercises: [
          { name: "Push-ups", type: "sets_reps", sets: 3, reps: 12 },
          { name: "Plank", type: "duration", durationMinutes: 5 },
        ],
      },
    ],
    meals: [
      { category: "breakfast", items: [{ name: "Eggs", amount: "3" }] },
      { category: "dinner", items: [{ name: "Chicken curry", amount: "1 bowl" }] },
    ],
  },
  {
    date: "2026-06-04",
    sleep: { bedTime: "00:10", wakeTime: "07:20", durationMinutes: 430 },
    workouts: [],
    meals: [{ category: "junk_food", items: [{ name: "Burger", amount: "1" }] }],
  },
  {
    date: "2026-06-05",
    sleep: { bedTime: "23:05", wakeTime: "06:35", durationMinutes: 450 },
    workouts: [
      {
        timeOfDay: "evening",
        exercises: [
          { name: "Deadlift", type: "sets_reps", sets: 3, reps: 5 },
          { name: "Rows", type: "sets_reps", sets: 3, reps: 10 },
        ],
      },
    ],
    meals: [{ category: "dinner", items: [{ name: "Fish and rice", amount: "1 plate" }] }],
  },
  {
    date: "2026-06-06",
    sleep: { bedTime: "23:30", wakeTime: "07:00", durationMinutes: 450 },
    workouts: [],
    meals: [
      { category: "breakfast", items: [{ name: "Poha", amount: "1 bowl" }] },
      { category: "cheat_meal", items: [{ name: "Pizza", amount: "2 slices" }] },
    ],
  },
  {
    date: "2026-06-07",
    sleep: { bedTime: "22:45", wakeTime: "06:20", durationMinutes: 455 },
    workouts: [
      {
        timeOfDay: "morning",
        exercises: [{ name: "Cycling", type: "duration", durationMinutes: 35 }],
      },
    ],
    meals: [{ category: "lunch", items: [{ name: "Rajma rice", amount: "1 plate" }] }],
  },
  {
    date: "2026-06-08",
    sleep: { bedTime: "23:20", wakeTime: "06:55", durationMinutes: 455 },
    workouts: [],
    meals: [{ category: "breakfast", items: [{ name: "Curd bowl", amount: "1" }] }],
  },
  {
    date: "2026-06-09",
    sleep: { bedTime: "23:00", wakeTime: "06:40", durationMinutes: 460 },
    workouts: [
      {
        timeOfDay: "evening",
        exercises: [
          { name: "Bench press", type: "sets_reps", sets: 4, reps: 8 },
          { name: "Shoulder press", type: "sets_reps", sets: 3, reps: 10 },
        ],
      },
    ],
    meals: [
      { category: "lunch", items: [{ name: "Chicken wrap", amount: "1" }] },
      { category: "dinner", items: [{ name: "Khichdi", amount: "1 bowl" }] },
    ],
  },
  {
    date: "2026-06-10",
    sleep: { bedTime: "00:05", wakeTime: "07:15", durationMinutes: 430 },
    workouts: [],
    meals: [{ category: "junk_food", items: [{ name: "Fries", amount: "1 box" }] }],
  },
  {
    date: "2026-06-11",
    sleep: { bedTime: "22:50", wakeTime: "06:30", durationMinutes: 460 },
    workouts: [
      {
        timeOfDay: "morning",
        exercises: [
          { name: "Lunges", type: "sets_reps", sets: 3, reps: 12 },
          { name: "Jog", type: "duration", durationMinutes: 18 },
        ],
      },
    ],
    meals: [{ category: "dinner", items: [{ name: "Paneer salad", amount: "1 bowl" }] }],
  },
  {
    date: "2026-06-12",
    sleep: { bedTime: "23:10", wakeTime: "06:45", durationMinutes: 455 },
    workouts: [],
    meals: [{ category: "breakfast", items: [{ name: "Smoothie", amount: "1 glass" }] }],
  },
  {
    date: "2026-06-13",
    sleep: { bedTime: "23:35", wakeTime: "07:05", durationMinutes: 450 },
    workouts: [
      {
        timeOfDay: "afternoon",
        exercises: [{ name: "Swimming", type: "duration", durationMinutes: 30 }],
      },
    ],
    meals: [{ category: "cheat_meal", items: [{ name: "Biryani", amount: "1 plate" }] }],
  },
  {
    date: "2026-06-14",
    sleep: null,
    workouts: [],
    meals: [],
    naps: [],
  },
];

export const isDummyToken = (token) => token === DUMMY_TOKEN;

// Post-process DUMMY_LOGS to align with server schema
DUMMY_LOGS.forEach((log) => {
  if (log.sleep && log.sleep.bedTime && log.sleep.wakeTime) {
    const date = log.date;
    const [bedH, bedM] = log.sleep.bedTime.split(":").map(Number);
    const [wakeH, wakeM] = log.sleep.wakeTime.split(":").map(Number);
    
    const crossesMidnight = wakeH < bedH || (wakeH === bedH && wakeM < bedM);
    
    let wokeUpDateStr = date;
    if (crossesMidnight) {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      wokeUpDateStr = `${year}-${month}-${day}`;
    }
    
    log.sleep = {
      fellAsleepDate: date,
      fellAsleepTime: `${date}T${log.sleep.bedTime}:00.000Z`,
      wokeUpDate: wokeUpDateStr,
      wokeUpTime: `${wokeUpDateStr}T${log.sleep.wakeTime}:00.000Z`,
      duration: log.sleep.durationMinutes,
      durationMinutes: log.sleep.durationMinutes, // compatibility
      crossesMidnight,
      bedTime: log.sleep.bedTime, // compatibility
      wakeTime: log.sleep.wakeTime, // compatibility
    };
  }
});

export const todayIsoDate = () => "2026-06-14";

export const dummyTodayLog = () =>
  DUMMY_LOGS.find((log) => log.date === todayIsoDate()) || DUMMY_LOGS.at(-1);

export const dummySummary = {
  avgSleepMinutes: 453,
  totalWorkoutSessions: 6,
  junkFoodCount: 2,
  cheatMealCount: 2,
  totalDays: 14,
};
