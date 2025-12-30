'use client';

import { NumberTicker } from '@/components/ddd/NumberTicker';

interface TotalDisplayProps {
  total: number;
}

export function TotalDisplay({ total }: TotalDisplayProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
      <span className="text-sm font-medium">Total Amount:</span>
      <NumberTicker
        value={total}
        format={(val) => `$${val.toFixed(2)}`}
        className="text-lg font-bold"
      />
    </div>
  );
}