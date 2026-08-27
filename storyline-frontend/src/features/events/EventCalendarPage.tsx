import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
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

export default function EventCalendarPage() {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Controlled calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

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

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setCurrentView(newView);
  };

  const openDayDetails = (date: Date) => {
    // Find all events/tasks that fall on this date
    // Normalizing dates for comparison (ignoring time)
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
    // Instead of navigating, open the modal for the start date of this event
    openDayDetails(event.start);
  };

  const handleShowMore = (events: any[], date: Date) => {
    openDayDetails(date);
  };

  const eventStyleGetter = (event: any) => {
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
      className: 'custom-calendar-event',
      style: {
        backgroundColor,
        color: event.type === 'TASK' && event.resource.status === 'PENDING' ? 'var(--text-main)' : '#fff',
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

      <div className="card calendar-container">
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
            date={currentDate}
            view={currentView}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onShowMore={handleShowMore}
            selectable={true}
            popup={false} // Disable default popup to use our custom modal
            eventPropGetter={eventStyleGetter}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            tooltipAccessor={(e: any) => `${e.title}\nStatus: ${e.resource.status}`}
          />
        )}
      </div>

      {/* Day Details Modal */}
      {showModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                Agenda for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No events or tasks scheduled for this day.
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
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{item.title}</h4>
                      <span className="badge badge-primary">{item.type}</span>
                    </div>
                    
                    {item.type === 'EVENT' ? (
                      <>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Status: <strong>{item.resource.status}</strong><br/>
                          Location: {item.resource.location || 'TBA'}
                        </p>
                        <button 
                          className="btn btn-primary btn-sm" 
                          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
                          onClick={() => navigate(`/events/${item.resource.id}`)}
                        >
                          Go to Event Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Status: <strong>{item.resource.status}</strong><br/>
                          Priority: {item.resource.priority}
                        </p>
                        <button 
                          className="btn btn-outline btn-sm" 
                          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
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
