// src/components/tools/BreakdownRow.tsx
//
// One row in the per-loan breakdown table. Label on the left, formatted value
// on the right with optional +/- sign indicating revenue vs cost.

interface Props {
  label: string;
  value: string;
  sign?: '+' | '-' | '';
}

export default function BreakdownRow({ label, value, sign = '' }: Props) {
  const valueColor = sign === '-' ? 'text-muted' : 'text-ink';
  return (
    <div class="flex items-baseline justify-between gap-4 py-1.5 text-sm">
      <span class="text-muted">{label}</span>
      <span class={`font-mono tabular-nums ${valueColor}`}>
        {sign && <span aria-hidden="true">{sign}&nbsp;</span>}
        {value}
      </span>
    </div>
  );
}
