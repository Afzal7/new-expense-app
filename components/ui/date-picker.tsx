"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { cn } from "@/lib/utils"

// Custom styles for react-datepicker to match shadcn theme
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;
  }

  .react-datepicker {
    font-family: inherit;
    border: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px);
    background-color: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }

  .react-datepicker__triangle {
    display: none;
  }

  .react-datepicker__header {
    background-color: hsl(var(--muted));
    border-bottom: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0 0;
    padding: 12px;
  }

  .react-datepicker__current-month {
    color: hsl(var(--foreground));
    font-weight: 600;
    font-size: 0.875rem;
  }

  .react-datepicker__month-container {
    background-color: hsl(var(--popover));
  }

  .react-datepicker__day-names {
    background-color: hsl(var(--muted));
    border-bottom: 1px solid hsl(var(--border));
  }

  .react-datepicker__day-name {
    color: hsl(var(--muted-foreground));
    font-size: 0.75rem;
    font-weight: 500;
    width: 32px;
    line-height: 32px;
  }

  .react-datepicker__day {
    color: hsl(var(--foreground));
    width: 32px;
    line-height: 32px;
    margin: 1px;
    border-radius: calc(var(--radius) - 2px);
    font-size: 0.875rem;
  }

  .react-datepicker__day:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  .react-datepicker__day--selected {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .react-datepicker__day--keyboard-selected {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .react-datepicker__day--today {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    font-weight: 600;
  }

  .react-datepicker__navigation {
    background: none;
    border: none;
    cursor: pointer;
    outline: none;
    top: 12px;
    width: 24px;
    height: 24px;
    border-radius: calc(var(--radius) - 2px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .react-datepicker__navigation:hover {
    background-color: hsl(var(--accent));
  }

  .react-datepicker__navigation-icon::before {
    border-color: hsl(var(--foreground));
    border-width: 1px 1px 0 0;
  }

  .react-datepicker__month-dropdown,
  .react-datepicker__year-dropdown {
    background-color: hsl(var(--popover));
    border: 1px solid hsl(var(--border));
    border-radius: calc(var(--radius) - 2px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    max-height: 200px;
    overflow-y: auto;
  }

  .react-datepicker__month-option,
  .react-datepicker__year-option {
    color: hsl(var(--foreground));
    padding: 8px 12px;
    cursor: pointer;
  }

  .react-datepicker__month-option:hover,
  .react-datepicker__year-option:hover {
    background-color: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }

  .react-datepicker__month-option--selected,
  .react-datepicker__year-option--selected {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = datePickerStyles;
  document.head.appendChild(styleSheet);
}

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Select expense date",
  className,
}: DatePickerProps) {
  const handleSelect = (selectedDate: Date | null) => {
    onSelect?.(selectedDate || undefined)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <ReactDatePicker
          selected={date}
          onChange={handleSelect}
          className="w-full h-10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background rounded-md"
          placeholderText={placeholder}
          dateFormat="MMMM d, yyyy"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          yearDropdownItemNumber={10}
          scrollableYearDropdown
          calendarClassName="!shadow-lg !border !rounded-md !bg-popover !text-popover-foreground"
        />
        <CalendarIcon
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        />
      </div>
    </div>
  )
}