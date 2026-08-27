import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventsApi, tasksApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './calendar-overrides.css'; // Optional for dark mode styling

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsRes, tasksRes] = await Promise.all([
        eventsApi.listEvents(),
        tasksApi.list()
      ]);

      const events = eventsRes.data.data.content || [];
      const tasks = tasksRes.data.data || [];

      const formattedData: any[] = [];

      // Map Events
      events.forEach((ev: any) => {
        if (ev.startDate) {
          formattedData.push({
            id: ev.id,
            title: `[Event] ${ev.name}`,
            start: new Date(ev.startDate),
            end: ev.endDate ? new Date(ev.endDate) : new Date(ev.startDate),
            allDay: true,
            type: 'EVENT',
            resource: ev,
          });
        }
      });

      // Map Tasks
      tasks.forEach((task: any) => {
        if (task.dueDate) {
          formattedData.push({
            id: `task-${task.id}`,
            title: `[Task] ${task.title} - ${task.event?.name || 'No Event'}`,
            start: new Date(task.dueDate),
            end: new Date(task.dueDate),
            allDay: true,
            type: 'TASK',
            resource: task,
          });
        }
      });

      setCalendarEvents(formattedData);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: any) => {
    if (event.type === 'EVENT') {
      navigate(`/events/${event.id}`);
    } else if (event.type === 'TASK') {
      if (event.resource.event?.id) {
        navigate(`/events/${event.resource.event.id}`);
      }
    }
  };

  const eventStyleGetter = (event: any, start: any, end: any, isSelected: boolean) => {
    let backgroundColor = 'var(--primary)';
    
    if (event.type === 'EVENT') {
      switch (event.resource.status) {
        case 'CONFIRMED': backgroundColor = 'var(--success)'; break;
        case 'TENTATIVE': backgroundColor = 'var(--warning)'; break;
        case 'IN_PROGRESS': backgroundColor = 'var(--info)'; break;
        case 'CANCELLED': backgroundColor = 'var(--danger)'; break;
        case 'COMPLETED': backgroundColor = 'var(--text-muted)'; break;
      }
    } else if (event.type === 'TASK') {
      switch (event.resource.status) {
        case 'COMPLETED': backgroundColor = 'var(--success)'; break;
        case 'ISSUE': backgroundColor = 'var(--danger)'; break;
        case 'IN_PROGRESS': backgroundColor = 'var(--warning)'; break;
        default: backgroundColor = 'var(--border-color)'; break; // Pending tasks
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: event.type === 'TASK' && event.resource.status === 'PENDING' ? 'var(--text-main)' : '#fff',
        border: '0px',
        display: 'block',
        fontSize: '0.85rem'
      }
    };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Calendar</h1>
          <p className="page-subtitle">Schedule view of all upcoming events and task deadlines</p>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', height: 'calc(100vh - 180px)', minHeight: '600px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Loading Calendar...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            tooltipAccessor={(e: any) => `${e.title}\nStatus: ${e.resource.status}`}
          />
        )}
      </div>
    </div>
  );
}
