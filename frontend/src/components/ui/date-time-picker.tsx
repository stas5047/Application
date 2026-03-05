import DatePicker from 'react-datepicker';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  label?: string;
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
        onChange={(date: Date | null) => {
          onChange(date);
          onBlur();
        }}
        showTimeSelect
        timeIntervals={15}
        dateFormat="MMM d, yyyy h:mm aa"
        minDate={new Date()}
        wrapperClassName="w-full"
        popperPlacement="bottom-start"
        customInput={
          <Input
            id={id}
            aria-invalid={!!error}
            readOnly
          />
        }
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}