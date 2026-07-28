import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RecurrenceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESETS = [
  { label: 'Every day', value: 'FREQ=DAILY' },
  { label: 'Every weekday', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
  { label: 'Once a week', value: 'FREQ=WEEKLY' },
  { label: 'Once a month', value: 'FREQ=MONTHLY' },
];

export function RecurrenceEditor({ value, onChange }: RecurrenceEditorProps) {
  // If the passed rrule doesn't exactly match our basic presets, default to Daily visually,
  // or add a "Custom" option. For V1 we just match closest preset.
  const isPreset = PRESETS.some((p) => p.value === value);
  const displayValue = isPreset ? value : 'FREQ=DAILY';

  return (
    <div className="grid gap-2">
      <Label>Recurrence</Label>
      <Select value={displayValue} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select recurrence" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
