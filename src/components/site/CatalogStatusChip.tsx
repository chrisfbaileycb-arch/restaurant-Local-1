import React from 'react';
import { Database, CloudOff, RefreshCw } from 'lucide-react';
import type { CatalogSource } from '@/lib/catalog';

/**
 * Surfaces the catalog fallback state so nobody has to open the console to
 * find out the storefront is serving cached pricing.
 *
 * `source` is passed in by the page (catalogSource() is module state, not
 * reactive), so the chip always matches the data actually on screen.
 */

const LIVE_TIP =
  'Products, prices and stock were read from the live database just now.';
const OFFLINE_TIP =
  'The live database did not answer, so the storefront is serving its bundled catalog snapshot. Everything still works, but prices may be a few hours stale — confirm before quoting.';

interface Props {
  source: CatalogSource;
  /** Optional retry handler — renders a "Retry live catalog" button beside the chip. */
  onRetry?: () => void;
  retrying?: boolean;
  /** 'light' for white/stone pages, 'dark' for the slate device hub. */
  tone?: 'light' | 'dark';
  className?: string;
}

const CatalogStatusChip: React.FC<Props> = ({
  source,
  onRetry,
  retrying = false,
  tone = 'light',
  className = '',
}) => {
  const live = source === 'live';

  const liveStyles =
    tone === 'dark'
      ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';
  const offlineStyles =
    tone === 'dark'
      ? 'border-amber-400/30 bg-amber-400/15 text-amber-300'
      : 'border-amber-300 bg-amber-50 text-amber-800';

  const retryStyles =
    tone === 'dark'
      ? 'border-white/20 bg-white/5 text-white hover:bg-white/15'
      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100';

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span
        title={live ? LIVE_TIP : OFFLINE_TIP}
        aria-label={live ? LIVE_TIP : OFFLINE_TIP}
        className={`inline-flex cursor-help items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
          live ? liveStyles : offlineStyles
        }`}
      >
        {live ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Database className="h-3.5 w-3.5" />
            Live catalog
          </>
        ) : (
          <>
            <CloudOff className="h-3.5 w-3.5" />
            Offline catalog · cached pricing
          </>
        )}
      </span>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          title="Re-query the database for products, prices and stock."
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition disabled:opacity-50 ${retryStyles}`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Checking…' : 'Retry live catalog'}
        </button>
      )}
    </span>
  );
};

export default CatalogStatusChip;
