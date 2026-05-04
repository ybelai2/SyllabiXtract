import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isSameMonth } from 'date-fns';
import { Maximize2, X, ChevronLeft, ChevronRight, Save, Download, Trash2, Calendar as CalIcon, GripVertical } from 'lucide-react';
import { createEvents } from 'ics';

// Atmospheric Glowing & Drifting Starfield
const Starfield = ({ darkMode }) => {
  const [stars] = useState(() => 
    Array.from({ length: 60 }).map(() => {
      const sizeVal = Math.random() * 2 + 1;
      const glowCore = sizeVal * 3;
      const glowHalo = sizeVal * 6;
      
      return {
        id: Math.random(),
        left: `${Math.random() * 100}%`,
        size: `${sizeVal}px`,
        driftDuration: `${Math.random() * 20 + 20}s`, 
        driftDelay: `-${Math.random() * 40}s`,
        pulseDuration: `${Math.random() * 4 + 2}s`, 
        pulseDelay: `-${Math.random() * 5}s`,
        boxShadow: `0 0 ${glowCore}px ${sizeVal}px rgba(255, 255, 255, 0.9), 0 0 ${glowHalo}px ${sizeVal * 2}px rgba(96, 165, 250, 0.6)`,
      };
    })
  );

  if (!darkMode) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[2.5rem]">
      <style>{`
        @keyframes driftUp {
          0% { top: 110%; }
          100% { top: -10%; }
        }
        @keyframes deepTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.05; transform: scale(0.8); }
        }
      `}</style>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            width: star.size,
            height: star.size,
            boxShadow: star.boxShadow,
            animation: `
              driftUp ${star.driftDuration} linear ${star.driftDelay} infinite,
              deepTwinkle ${star.pulseDuration} ease-in-out ${star.pulseDelay} infinite
            `,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/60 to-slate-900/90"></div>
    </div>
  );
};

export default function SyllabusCalendar({ data, darkMode }) {
  // data is now an array of courses
  const [courses, setCourses] = useState(data);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // We need to track exactly which course and which deadline is being interacted with
  const [editingEvent, setEditingEvent] = useState(null); // { cIdx, dIdx }
  const [draggedEvent, setDraggedEvent] = useState(null); // { cIdx, dIdx }
  const [dragOverDate, setDragOverDate] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setCourses(data);
      // Autojump calendar to the first available date in any course
      let foundDate = false;
      for (const course of data) {
        if (course.deadlines && course.deadlines.length > 0) {
          const firstWithDate = course.deadlines.find(d => d.due_date && d.due_date !== "null");
          if (firstWithDate) {
            setCurrentDate(parseISO(firstWithDate.due_date));
            foundDate = true;
            break;
          }
        }
      }
      if (!foundDate) setCurrentDate(new Date());
    }
  }, [data]);

  if (!courses || courses.length === 0) return null;

  // --- Flatten all deadlines into one master list ---
  const allDeadlines = courses.flatMap((course, cIdx) => 
    (course.deadlines || []).map((deadline, dIdx) => ({
      ...deadline,
      course_code: course.course_code,
      cIdx, // Keep track of parent course index
      dIdx  // Keep track of deadline index inside that course
    }))
  );

  // Group by date
  const eventsByDate = {};
  allDeadlines.forEach((event) => {
    if (event.due_date && event.due_date !== "null") {
      if (!eventsByDate[event.due_date]) eventsByDate[event.due_date] = [];
      eventsByDate[event.due_date].push(event);
    }
  });

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[editingEvent.cIdx].deadlines[editingEvent.dIdx][field] = value;
    setCourses(updatedCourses);
  };

  const removeDeadline = () => {
    const updatedCourses = [...courses];
    updatedCourses[editingEvent.cIdx].deadlines.splice(editingEvent.dIdx, 1);
    setCourses(updatedCourses);
    setEditingEvent(null);
  };

  const handleDragStart = (e, cIdx, dIdx) => {
    setDraggedEvent({ cIdx, dIdx });
    e.dataTransfer.effectAllowed = "move"; 
  };

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    if (dragOverDate !== dateStr) setDragOverDate(dateStr);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverDate(null);
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    setDragOverDate(null);
    if (!draggedEvent) return;

    const updatedCourses = [...courses];
    updatedCourses[draggedEvent.cIdx].deadlines[draggedEvent.dIdx].due_date = targetDateStr;
    setCourses(updatedCourses);
    setDraggedEvent(null);
  };

  const downloadICS = () => {
    const validEvents = allDeadlines.filter(d => d.due_date && d.due_date.includes('-'));
    const events = validEvents.map(d => {
      const [year, month, day] = d.due_date.split('-').map(Number);
      return {
        title: `[${d.course_code || 'CLASS'}] ${d.title}`,
        description: d.description || '',
        start: [year, month, day, 12, 0],
        duration: { hours: 1 }
      };
    });

    createEvents(events, (error, value) => {
      if (error) return console.error(error);
      const blob = new Blob([value], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SyllabiXtract_Schedule.ics`;
      link.click();
    });
  };

  // --- Calendar Math ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // --- Theming & Scrollbars ---
  const textMain = darkMode ? 'text-white' : 'text-slate-800';
  const textMuted = darkMode ? 'text-slate-300' : 'text-slate-600';
  
  const bgGlass = darkMode 
    ? 'bg-slate-900/60 backdrop-blur-2xl border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]' 
    : 'bg-white/60 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]';

  const bgDay = darkMode 
    ? 'bg-slate-800/40 hover:bg-slate-700/60 border-slate-700/50' 
    : 'bg-white/50 hover:bg-white/80 border-slate-200/50';
  const bgDayNotMonth = darkMode 
    ? 'bg-slate-900/30 text-slate-500 border-slate-800/50' 
    : 'bg-slate-100/30 text-slate-400 border-slate-200/30';
  
  const modernScrollbar = `
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-transparent 
    [&::-webkit-scrollbar-thumb]:rounded-full 
    ${darkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-600/50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/80' 
               : '[&::-webkit-scrollbar-thumb]:bg-slate-300/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400/80'}
  `;

  // UI Strings
  const calendarTitle = courses.length > 1 ? "Combined Master Schedule" : `${courses[0].course_code} Schedule`;
  const totalEvents = allDeadlines.length;

  // VIEW 1: THE MINI PREVIEW (NO STARS)
  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className={`w-full max-w-2xl mt-8 rounded-3xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] overflow-hidden group relative ${bgGlass}`}
      >
        <div className={`relative z-10 p-5 border-b flex justify-between items-center ${darkMode ? 'border-slate-700/50 bg-slate-800/30' : 'border-white/40 bg-white/40'}`}>
          <div>
            <h3 className={`font-black flex items-center gap-2 text-lg ${textMain}`}>
              <CalIcon size={20} className="text-blue-500 drop-shadow-sm" />
              {calendarTitle}
            </h3>
            <p className={`text-sm font-medium mt-0.5 ${textMuted}`}>{totalEvents} Events Across {courses.length} Course{courses.length > 1 ? 's' : ''}</p>
          </div>
          <div className="bg-blue-600/90 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100">
            <Maximize2 size={18} />
          </div>
        </div>
        
        <div className="relative z-10 p-6 pointer-events-none">
          <div className="text-center font-black tracking-tight mb-4 text-blue-500/90 drop-shadow-sm text-lg">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className={`text-center text-xs font-bold mb-1 ${textMuted}`}>{day}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasEvents = eventsByDate[dateStr]?.length > 0;
              return (
                <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all
                  ${isSameMonth(day, monthStart) ? (darkMode ? 'text-slate-200' : 'text-slate-700') : 'text-transparent'}
                  ${hasEvents ? 'bg-blue-500/90 text-white shadow-lg shadow-blue-500/30 scale-110 ring-2 ring-white/20' : ''}
                `}>
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: THE FULL CALENDAR MODAL (WITH STARS)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative w-full max-w-6xl h-[90vh] flex flex-col rounded-[2.5rem] overflow-hidden ring-1 ring-white/20 ${bgGlass}`}>
        
        <Starfield darkMode={darkMode} />

        {/* Header */}
        <div className={`relative z-10 p-6 border-b flex justify-between items-center overflow-hidden ${darkMode ? 'border-slate-700/50' : 'border-white/50'}`}>
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${darkMode ? 'from-blue-500 to-purple-600' : 'from-blue-400 to-purple-500'}`}></div>
          
          <div className="relative z-10 drop-shadow-sm">
            <h2 className={`text-3xl font-black tracking-tight ${textMain}`}>
              {courses.length > 1 ? "Master Schedule" : courses[0].course_code}
            </h2>
            <p className={`font-bold text-blue-600/90 dark:text-blue-400 mt-1`}>
              {courses.length > 1 ? `${courses.length} courses loaded` : courses[0].course_name}
            </p>
          </div>

          <div className={`flex items-center gap-6 relative z-10 backdrop-blur-md px-4 py-2 rounded-2xl ring-1 shadow-sm ${darkMode ? 'bg-slate-800/50 ring-white/10' : 'bg-white/50 ring-black/5'}`}>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={`p-1.5 rounded-full hover:bg-slate-500/20 transition-colors ${textMain}`}>
              <ChevronLeft size={24} />
            </button>
            <h2 className={`text-xl font-black w-44 text-center tracking-tight ${textMain}`}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={`p-1.5 rounded-full hover:bg-slate-500/20 transition-colors ${textMain}`}>
              <ChevronRight size={24} />
            </button>
          </div>

          <button onClick={() => setIsExpanded(false)} className={`relative z-10 p-3 backdrop-blur-md ring-1 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all shadow-sm ${darkMode ? 'bg-slate-800/50 ring-white/10' : 'bg-white/50 ring-black/5'}`}>
            <X size={24} />
          </button>
        </div>

        {/* Calendar Grid Container */}
        <div className={`relative z-10 flex-1 overflow-y-auto p-6 pr-4 ${modernScrollbar} ${darkMode ? 'bg-slate-900/40' : 'bg-slate-50/20'}`}>
          <div className="grid grid-cols-7 gap-3 h-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className={`text-center font-black uppercase tracking-widest text-xs mb-1 drop-shadow-sm ${textMuted}`}>{day}</div>
            ))}
            
            {calendarDays.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dateStr] || [];
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const isDragTarget = dragOverDate === dateStr;

              return (
                <div 
                  key={i} 
                  onDragOver={(e) => handleDragOver(e, dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, dateStr)}
                  className={`min-h-[120px] rounded-2xl border flex flex-col transition-all duration-300 overflow-hidden backdrop-blur-md
                    ${isCurrentMonth ? bgDay : bgDayNotMonth}
                    ${isToday ? 'ring-2 ring-blue-500/80 shadow-lg shadow-blue-500/20 bg-blue-500/10' : ''}
                    ${isDragTarget ? 'ring-2 ring-purple-500 bg-purple-500/20 scale-[1.02] shadow-xl' : ''}
                  `}
                >
                  <div className={`text-right text-sm font-black p-2.5 mb-1 
                    ${isCurrentMonth ? textMain : ''} 
                    ${isToday ? 'text-blue-500 drop-shadow-sm' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className={`flex-1 space-y-2 overflow-y-auto p-2 pt-0 ${modernScrollbar}`}>
                    {dayEvents.map((evt, idx) => (
                      <div 
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, evt.cIdx, evt.dIdx)}
                        onClick={() => setEditingEvent({ cIdx: evt.cIdx, dIdx: evt.dIdx })}
                        className={`group relative text-xs font-bold p-2.5 rounded-xl cursor-grab active:cursor-grabbing border-l-4 transition-all hover:scale-[1.02] shadow-sm backdrop-blur-md
                          ${darkMode 
                            ? 'bg-slate-800/80 border-l-blue-400 text-slate-100 hover:bg-slate-700/90 ring-1 ring-white/10' 
                            : 'bg-white/90 border-l-blue-500 text-slate-700 hover:bg-white ring-1 ring-slate-200/50'
                          }
                        `}
                        title={evt.title}
                      >
                        <div className="flex items-start justify-between gap-1">
                          {/* Prepend the course code if there's more than one course */}
                          <span className="truncate pr-4 drop-shadow-sm">
                            {courses.length > 1 ? `[${evt.course_code}] ` : ''}{evt.title}
                          </span>
                          <GripVertical size={14} className="opacity-0 group-hover:opacity-100 text-slate-400 absolute right-1.5 top-2.5 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Event Glass Popover */}
        {editingEvent !== null && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`w-full max-w-md p-7 rounded-[2rem] shadow-2xl border ring-1 ring-white/20 animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-slate-900/90 backdrop-blur-3xl border-slate-700/50' : 'bg-white/90 backdrop-blur-3xl border-white/60'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-black ${textMain}`}>Edit Event</h3>
                <button onClick={() => setEditingEvent(null)} className="p-2 hover:bg-slate-500/20 rounded-full transition-colors text-slate-400"><X size={20}/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${textMuted}`}>Title</label>
                  <input 
                    className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-blue-500 focus:ring-4 ring-blue-500/20 font-bold bg-transparent ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`}
                    value={courses[editingEvent.cIdx].deadlines[editingEvent.dIdx].title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${textMuted}`}>Date</label>
                  <input 
                    type="date"
                    className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-blue-500 focus:ring-4 ring-blue-500/20 font-mono bg-transparent ${darkMode ? 'border-slate-600 text-white [color-scheme:dark]' : 'border-slate-300 text-slate-900'}`}
                    value={courses[editingEvent.cIdx].deadlines[editingEvent.dIdx].due_date}
                    onChange={(e) => handleInputChange('due_date', e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${textMuted}`}>Notes</label>
                  <textarea 
                    className={`w-full p-3 rounded-xl border outline-none transition-all focus:border-blue-500 focus:ring-4 ring-blue-500/20 h-28 resize-none bg-transparent ${modernScrollbar} ${darkMode ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-900'}`}
                    value={courses[editingEvent.cIdx].deadlines[editingEvent.dIdx].description}
                    placeholder="Add specific details or links..."
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={removeDeadline} className="flex items-center gap-2 text-red-500 hover:text-white font-bold px-4 py-3 rounded-xl hover:bg-red-500 transition-all border border-red-500/30">
                  <Trash2 size={18} /> Delete
                </button>
                <button onClick={() => setEditingEvent(null)} className="bg-blue-600/90 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                  Done Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className={`relative z-10 p-6 border-t flex flex-wrap gap-4 justify-between items-center ${darkMode ? 'border-slate-700/50 bg-slate-800/40' : 'border-white/50 bg-white/40'}`}>
          <p className={`text-sm font-medium flex items-center gap-2 ${textMuted}`}>
            <GripVertical size={16} className="text-blue-500 drop-shadow-sm" />
            Drag and drop events to reschedule them.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={downloadICS} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md backdrop-blur-md
                ${darkMode ? 'bg-slate-700/80 hover:bg-slate-600 text-white ring-1 ring-white/10' : 'bg-white/80 hover:bg-white text-slate-800 ring-1 ring-slate-200/50'}
              `}
            >
              <Download size={20} /> Export .ics
            </button>
            <button className="flex items-center gap-2 bg-blue-600/90 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 backdrop-blur-md ring-1 ring-white/20">
              <Save size={20} /> Save Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}