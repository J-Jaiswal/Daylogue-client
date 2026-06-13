import { useState, useEffect } from "react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function LiveDate() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // update every minute — no need for per-second updates
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dayName = DAYS[now.getDay()];
  const date = now.getDate();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return (
    <div className="live-date">
      <div className="live-date-day">{dayName}</div>
      <div className="live-date-full">
        {date} {month} {year}
      </div>
      <div className="live-date-time">
        {displayHour}:{minutes} {ampm}
      </div>
    </div>
  );
}
