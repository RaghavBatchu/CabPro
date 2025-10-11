import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
  // if true, disable times before current time (useful when selected date is today)
  disablePast?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = "Select time",
  className,
  disablePast = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
  
  const selectedTime = value ? value.split(':') : ['', ''];
  const selectedHour = selectedTime[0] || '';
  const selectedMinute = selectedTime[1] || '';

  const formatTime = (hour: string, minute: string) => {
    if (!hour || !minute) return placeholder;
    const h = parseInt(hour);
    const m = parseInt(minute);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const handleHourChange = (hour: string) => {
    const newTime = `${hour}:${selectedMinute || '00'}`;
    onChange(newTime);
  };

  const handleMinuteChange = (minute: string) => {
    const newTime = `${selectedHour || '00'}:${minute}`;
    onChange(newTime);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const now = new Date();

  const isHourDisabled = (hourStr: string) => {
    if (!disablePast) return false;
    const h = parseInt(hourStr, 10);
    return h < now.getHours();
  };

  const isMinuteDisabled = (hourStr: string, minuteStr: string) => {
    if (!disablePast) return false;
    const h = parseInt(hourStr, 10);
    const m = parseInt(minuteStr, 10);
    if (h < now.getHours()) return true;
    if (h > now.getHours()) return false;
    // hour equals current hour
    return m < now.getMinutes();
  };

  const scrollToSelected = (containerId: string, selectedValue: string) => {
    const container = document.getElementById(containerId);
    if (container && selectedValue) {
      const selectedElement = container.querySelector(`[data-value="${selectedValue}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => {
              scrollToSelected('hour-scroll', selectedHour);
              scrollToSelected('minute-scroll', selectedMinute);
            }, 100);
          }
        }}
        className="w-full justify-start text-left font-normal"
      >
        <Clock className="mr-2 h-4 w-4" />
        {formatTime(selectedHour, selectedMinute)}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border bg-background p-4 shadow-lg">
          <div className="flex items-center justify-center gap-4">
            {/* Hour Selector */}
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-muted-foreground mb-2">Hour</div>
              <div className="relative">
                <div
                  id="hour-scroll"
                  className="h-32 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {hours.map((hour) => {
                    const disabled = isHourDisabled(hour);
                    return (
                      <Button
                        key={hour}
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-value={hour}
                        className={cn(
                          "w-12 h-8 text-sm",
                          disabled && "opacity-50 cursor-not-allowed",
                          selectedHour === hour
                            ? "bg-primary text-primary-foreground"
                            : !disabled && "hover:bg-accent"
                        )}
                        onClick={() => !disabled && handleHourChange(hour)}
                        disabled={disabled}
                      >
                        {parseInt(hour) === 0 ? '12' : parseInt(hour) > 12 ? (parseInt(hour) - 12).toString() : hour}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="text-2xl font-bold text-muted-foreground">:</div>

            {/* Minute Selector */}
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-muted-foreground mb-2">Minute</div>
              <div className="relative">
                <div
                  id="minute-scroll"
                  className="h-32 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {minutes.map((minute) => {
                    const disabled = isMinuteDisabled(selectedHour || '00', minute);
                    return (
                      <Button
                        key={minute}
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-value={minute}
                        className={cn(
                          "w-12 h-8 text-sm",
                          disabled && "opacity-50 cursor-not-allowed",
                          selectedMinute === minute
                            ? "bg-primary text-primary-foreground"
                            : !disabled && "hover:bg-accent"
                        )}
                        onClick={() => !disabled && handleMinuteChange(minute)}
                        disabled={disabled}
                      >
                        {minute}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
