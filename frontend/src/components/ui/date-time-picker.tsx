import type { ReactNode, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  label?: ReactNode;
  value: Date | null;
  onChange: (date: Date | null) => void;
  onBlur: () => void;
  error?: string;
  id?: string;
}

function toDateInputValue(date: Date | null): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toTimeInputValue(date: Date | null): string {
  if (!date) return '';
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function todayDateString(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DateTimePicker({ label, value, onChange, onBlur, error, id }: DateTimePickerProps) {
  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    const dateStr = e.target.value;
    if (!dateStr) { onChange(null); onBlur(); return; }
    const [year, month, day] = dateStr.split('-').map(Number);
    const base = value ? new Date(value) : new Date();
    if (!value) base.setHours(0, 0, 0, 0);
    base.setFullYear(year, month - 1, day);
    onChange(base);
    onBlur();
  }

  function handleTimeChange(e: ChangeEvent<HTMLInputElement>) {
    const timeStr = e.target.value;
    if (!timeStr) { onChange(null); onBlur(); return; }
    const [hours, minutes] = timeStr.split(':').map(Number);
    const base = value ? new Date(value) : new Date();
    base.setHours(hours, minutes, 0, 0);
    onChange(base);
    onBlur();
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="grid grid-cols-2 gap-3">
        <Input
          id={id}
          type="date"
          value={toDateInputValue(value)}
          min={todayDateString()}
          onChange={handleDateChange}
          onKeyDown={(e) => e.preventDefault()}
          aria-invalid={!!error}
        />
        <Input
          type="time"
          value={toTimeInputValue(value)}
          onChange={handleTimeChange}
          onKeyDown={(e) => e.preventDefault()}
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}