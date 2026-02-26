/**
 * Simple, readable console logger.
 * Usage: logger.info('message'), logger.info('message', 'Redis'), logger.error('message', 'Auth', err)
 */

function time() {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

function metaStr(meta) {
  if (meta == null) return '';
  if (meta instanceof Error) return ` (${meta.message})`;
  if (typeof meta === 'object') {
    const parts = Object.entries(meta).map(([k, v]) => `${k}: ${v}`);
    return parts.length ? ` (${parts.join(', ')})` : '';
  }
  return ` (${meta})`;
}

const BANNER_LINE = "════════════════════════════════════════════════════════════";

export const logger = {
  /** Key milestones: prints banner above and below the message */
  banner(message) {
    console.log(BANNER_LINE);
    console.log(`  ${message}`);
    console.log(BANNER_LINE);
  },
  info(message, context = null, meta = null) {
    const ctx = context ? ` ${context} ·` : '';
    console.log(`[${time()}]${ctx} ${message}${metaStr(meta)}`);
  },
  warn(message, context = null, meta = null) {
    const ctx = context ? ` ${context} ·` : '';
    console.warn(`[${time()}]${ctx} ${message}${metaStr(meta)}`);
  },
  error(message, context = null, meta = null) {
    const ctx = context ? ` ${context} ·` : '';
    const errMsg = meta instanceof Error ? meta.message : meta;
    console.error(`[${time()}]${ctx} ${message}${errMsg != null ? ` (${errMsg})` : ''}`);
    if (meta instanceof Error && meta.stack) console.error(meta.stack);
  },
  debug(message, context = null, meta = null) {
    if (process.env.DEBUG) {
      const ctx = context ? ` ${context} ·` : '';
      console.log(`[${time()}]${ctx} ${message}${metaStr(meta)}`);
    }
  },
};

export default logger;
