import React from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-theme.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

/**
 * Theme-aware calendar wrapper. Uses month view by default to avoid long time-slot lines.
 * Supports all react-big-calendar props (components, onNavigate, date, dayPropGetter, etc).
 */
export function CalendarWrapper({
  events = [],
  onSelectEvent,
  localizer: customLocalizer,
  startAccessor = "start",
  endAccessor = "end",
  style = { height: 540 },
  defaultView = Views.MONTH,
  views,
  components,
  onNavigate,
  date,
  dayPropGetter,
  selectable,
  eventPropGetter,
  ...props
}) {
  return (
    <div className="rbc-theme-wrapper rounded-xl overflow-hidden">
      <Calendar
        localizer={customLocalizer || localizer}
        events={events}
        startAccessor={startAccessor}
        endAccessor={endAccessor}
        defaultView={defaultView}
        views={views ?? [Views.MONTH, Views.WEEK, Views.AGENDA]}
        style={style}
        onSelectEvent={onSelectEvent}
        popup
        className="rbc-theme-aware"
        components={components}
        onNavigate={onNavigate}
        date={date}
        dayPropGetter={dayPropGetter}
        selectable={selectable}
        eventPropGetter={eventPropGetter}
        {...props}
      />
    </div>
  );
}
