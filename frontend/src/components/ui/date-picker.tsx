import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // parse value (YYYY-MM-DD) into local Date (avoid Date("YYYY-MM-DD") which creates UTC)
  const parseYmd = (ymd: string) => {
    const parts = ymd.split('-').map(Number);
    if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
    return new Date(ymd);
  };
  const selectedDate = value ? parseYmd(value) : null;

  // keep calendar showing selected date's month when value changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatYmd = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(formatYmd(selected));
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const isBeforeToday = (day: number) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // compare dates by ymd
    const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const todayYmd = ymd(new Date());
    const targetYmd = ymd(date);
    // If target is earlier than today
    return new Date(targetYmd) < new Date(todayYmd);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {selectedDate ? formatDate(selectedDate) : placeholder}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-md border bg-background p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const disabled = !day || isBeforeToday(day);
              return (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    disabled && "opacity-50 cursor-not-allowed",
                    day && isToday(day) && "bg-primary/10 text-primary font-semibold",
                    day && isSelected(day) && "bg-primary text-primary-foreground",
                    day && !isToday(day) && !isSelected(day) && !disabled && "hover:bg-accent"
                  )}
                  onClick={() => !disabled && day && handleDateSelect(day)}
                  disabled={disabled}
                >
                  {day}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
