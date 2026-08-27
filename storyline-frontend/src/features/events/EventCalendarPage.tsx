import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventsApi, tasksApi } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './calendar-overrides.css';

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

// Vibrant distinct colors for different events
const EVENT_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#e11d48', // Rose
];

export default function EventCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Controlled calendar state to fix navigation buttons
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<any>(Views.MONTH);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([]);

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
            title: ev.name,
            start: new Date(ev.startDate),
            end: new Date(ev.startDate), // Force 1-day render so it doesn't span across multiple columns
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
            title: `[Task] ${task.title}`,
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

  const openDayDetails = (date: Date) => {
    const targetDateStr = format(date, 'yyyy-MM-dd');
    
    const dayItems = calendarEvents.filter(ev => {
      const startStr = format(ev.start, 'yyyy-MM-dd');
      const endStr = format(ev.end, 'yyyy-MM-dd');
      return targetDateStr >= startStr && targetDateStr <= endStr;
    });

    setSelectedDate(date);
    setSelectedDayEvents(dayItems);
    setShowModal(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    openDayDetails(slotInfo.start);
  };

  const handleSelectEvent = (event: any) => {
    openDayDetails(event.start);
  };

  const handleShowMore = (events: any[], date: Date) => {
    openDayDetails(date);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: any) => {
    setCurrentView(newView);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = 'var(--primary)';
    
    if (event.type === 'EVENT') {
      // Assign a distinct vibrant color based on Event ID so events on the same day stand out
      const colorIndex = (event.resource.id || 0) % EVENT_COLORS.length;
      backgroundColor = EVENT_COLORS[colorIndex];
    } else if (event.type === 'TASK') {
      // Tasks are gray/subtle unless they have a status
      backgroundColor = '#6b7280'; // Default gray
      if (event.resource.status === 'COMPLETED') backgroundColor = '#10b981'; // Green
      if (event.resource.status === 'ISSUE') backgroundColor = '#ef4444'; // Red
      if (event.resource.status === 'IN_PROGRESS') backgroundColor = '#f59e0b'; // Amber
    }

    return {
      className: 'custom-calendar-event',
      style: {
        backgroundColor,
        color: '#ffffff', // Always white text for contrast on vibrant blocks
      }
    };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Calendar</h1>
          <p className="page-subtitle">Interactive schedule view. Click any date or event to see details.</p>
        </div>
      </div>

      <div className="calendar-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading Calendar...</span>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            view={currentView}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onShowMore={handleShowMore}
            onDrillDown={(date) => openDayDetails(date)}
            selectable={true}
            popup={false} 
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            tooltipAccessor={(e: any) => `${e.title}\nStatus: ${e.resource.status}`}
          />
        )}
      </div>

      {/* Day Details Modal */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 700 }}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ fontSize: '1.5rem', padding: '0 8px' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.1rem', margin: 0 }}>No events or tasks scheduled.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Enjoy your free day!</p>
                </div>
              ) : (
                selectedDayEvents.map((item, idx) => (
                  <div key={idx} style={{ 
                    padding: '16px', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{item.title}</h4>
                      <span className={`badge ${item.type === 'EVENT' ? 'badge-primary' : 'badge-secondary'}`}>{item.type}</span>
                    </div>
                    
                    {item.type === 'EVENT' ? (
                      <>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <strong>Status:</strong> {item.resource.status}<br/>
                          <strong>Location:</strong> {item.resource.location || 'TBA'}
                        </div>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ alignSelf: 'flex-start', marginTop: '8px', fontWeight: 600 }}
                          onClick={() => navigate(`/events/${item.resource.id}`)}
                        >
                          View Event Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          <strong>Status:</strong> {item.resource.status}<br/>
                          <strong>Priority:</strong> {item.resource.priority}
                        </div>
                        <button 
                          className="btn btn-outline btn-sm" 
                          style={{ alignSelf: 'flex-start', marginTop: '8px', fontWeight: 600 }}
                          onClick={() => {
                            if (item.resource.event?.id) {
                              navigate(`/events/${item.resource.event.id}`);
                            }
                          }}
                        >
                          View Parent Event
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
