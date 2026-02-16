import React, { useState } from "react";
import { format, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
const DayWeekPicker = ({
  onChange,
  locale = fr,
  mode: initialMode = "week", // 'range' or 'week'
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0)); // January 2026
  const [mode, setMode] = useState(initialMode); // 'day' or 'week'

  const months = [
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
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const generateCalendarDays = (date) => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(date);
    const days = [];

    // Previous month days
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
    const prevMonthDays = getDaysInMonth(prevMonth).daysInMonth;

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(
          prevMonth.getFullYear(),
          prevMonth.getMonth(),
          prevMonthDays - i,
        ),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(date.getFullYear(), date.getMonth(), day),
      });
    }

    return days;
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const handleDateClick = (date) => {
    if (mode === "week") {
      const dayOfWeek = date.getDay();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - dayOfWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      setStartDate(weekStart);
      setEndDate(weekEnd);
    } else {
      if (!startDate || (startDate && endDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        if (date < startDate) {
          setEndDate(startDate);
          setStartDate(date);
        } else {
          setEndDate(date);
        }
      }
    }
  };

  const formatDateRange = () => {
    if (!startDate) return "Select dates";
    if (!endDate)
      return startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction),
    );
  };

  const currentCalendarDays = generateCalendarDays(currentMonth);
  const nextMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
  );
  const nextCalendarDays = generateCalendarDays(nextMonth);

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        maxWidth: "900px",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Date Picker Range
      </h2>

      {/* Mode toggle */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
        <button
          onClick={() => setMode("range")}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: mode === "range" ? "2px solid #000" : "1px solid #ddd",
            background: mode === "range" ? "#f0f0f0" : "white",
            cursor: "pointer",
            fontWeight: mode === "range" ? "600" : "400",
          }}
        >
          Range
        </button>
        <button
          onClick={() => setMode("week")}
          style={{
            padding: "6px 16px",
            borderRadius: "6px",
            border: mode === "week" ? "2px solid #000" : "1px solid #ddd",
            background: mode === "week" ? "#f0f0f0" : "white",
            cursor: "pointer",
            fontWeight: mode === "week" ? "600" : "400",
          }}
        >
          Week
        </button>
      </div>

      {/* Selected date display */}
      <div
        style={{
          padding: "16px 20px",
          background: "#f8f8f8",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span style={{ fontSize: "16px" }}>{formatDateRange()}</span>
      </div>

      {/* Calendar */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: "40px" }}>
          {[currentMonth, nextMonth].map((month, monthIndex) => {
            const days =
              monthIndex === 0 ? currentCalendarDays : nextCalendarDays;

            return (
              <div key={monthIndex} style={{ flex: 1 }}>
                {/* Month header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  {monthIndex === 0 && (
                    <button
                      onClick={() => changeMonth(-1)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      ‹
                    </button>
                  )}
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      margin: 0,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {months[month.getMonth()]} {month.getFullYear()}
                  </h3>
                  {monthIndex === 1 && (
                    <button
                      onClick={() => changeMonth(1)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                    >
                      ›
                    </button>
                  )}
                </div>

                {/* Week days */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                    marginBottom: "8px",
                  }}
                >
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#999",
                        padding: "8px 0",
                        fontWeight: "500",
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "4px",
                  }}
                >
                  {days.map((dayObj, index) => {
                    const isSelected =
                      isSameDay(dayObj.date, startDate) ||
                      isSameDay(dayObj.date, endDate);
                    const isInRange = isDateInRange(dayObj.date);

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          dayObj.isCurrentMonth && handleDateClick(dayObj.date)
                        }
                        style={{
                          padding: "10px",
                          border: "none",
                          background: isSelected
                            ? "#000"
                            : isInRange
                              ? "#f0f0f0"
                              : "transparent",
                          color: isSelected
                            ? "#fff"
                            : !dayObj.isCurrentMonth
                              ? "#ccc"
                              : "#000",
                          borderRadius: "8px",
                          cursor: dayObj.isCurrentMonth ? "pointer" : "default",
                          fontSize: "14px",
                          fontWeight: isSelected ? "600" : "400",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (dayObj.isCurrentMonth && !isSelected) {
                            e.target.style.background = "#f8f8f8";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (
                            dayObj.isCurrentMonth &&
                            !isSelected &&
                            !isInRange
                          ) {
                            e.target.style.background = "transparent";
                          } else if (isInRange && !isSelected) {
                            e.target.style.background = "#f0f0f0";
                          }
                        }}
                      >
                        {dayObj.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayWeekPicker;
