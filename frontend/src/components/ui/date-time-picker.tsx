import type { ReactNode, KeyboardEvent } from 'react';
import DatePicker from 'react-datepicker';
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

export function DateTimePicker({ label, value, onChange, onBlur, error, id }: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <DatePicker
        selected={value}
        onChange={onChange}
        onBlur={onBlur}
        showTimeSelect
        timeIntervals={15}
        dateFormat="dd/MM/yyyy h:mm aa"
        minDate={new Date()}
        wrapperClassName="w-full"
        popperPlacement="bottom"
        customInput={
          <Input
            id={id}
            readOnly
            aria-invalid={!!error}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.preventDefault()}
          />
        }
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
