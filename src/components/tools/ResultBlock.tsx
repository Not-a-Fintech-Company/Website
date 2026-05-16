// src/components/tools/ResultBlock.tsx
//
// Large display number with a small uppercase caption above. Used for hero
// results like "Net profit per loan" / "ROA". Color emphasis communicates
// positive/negative/neutral.

interface Props {
  label: string;
  value: string;
  emphasis?: 'positive' | 'negative' | 'neutral';
}

export default function ResultBlock({ label, value, emphasis = 'neutral' }: Props) {
  const colorClass =
    emphasis === 'positive'
      ? 'text-accent'
      : emphasis === 'negative'
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-ink';

  return (
    <div>
      <p class="text-xs uppercase tracking-[0.2em] text-muted font-semibold mb-1.5">
        {label}
      </p>
      <p
        class={`font-display text-4xl md:text-5xl font-bold tracking-[-0.025em] tabular-nums leading-[1.05] ${colorClass}`}
      >
        {value}
      </p>
    </div>
  );
}
