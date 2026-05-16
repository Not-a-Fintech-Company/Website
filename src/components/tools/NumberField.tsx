// src/components/tools/NumberField.tsx
//
// Labeled numeric input with right-aligned suffix (e.g. "$", "%", "months").
// Used by TermLoanCalculator and reusable for the upcoming calculators.
//
// Emits `number` for any valid finite input, `''` for cleared field.
// Validation (clamping to min/max, format checks) lives in the parent.

interface Props {
  label: string;
  id: string;
  value: number | '';
  onChange: (v: number | '') => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string | null;
}

export default function NumberField({
  label,
  id,
  value,
  onChange,
  suffix,
  min,
  max,
  step = 0.01,
  error,
}: Props) {
  const errorId = `${id}-error`;
  return (
    <div class="flex flex-col gap-1.5">
      <label for={id} class="text-sm font-medium text-ink">
        {label}
      </label>
      <div class="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === '' ? '' : String(value)}
          min={min}
          max={max}
          step={step}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          onInput={(e) => {
            const raw = (e.target as HTMLInputElement).value;
            if (raw === '') {
              onChange('');
              return;
            }
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }}
          class="w-full px-3 py-2 pr-20 rounded-md border-2 border-rule bg-paper text-ink font-mono tabular-nums focus:outline-none focus:border-ink transition-colors"
        />
        {suffix && (
          <span class="absolute right-3 text-sm text-muted pointer-events-none font-mono">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} class="text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
