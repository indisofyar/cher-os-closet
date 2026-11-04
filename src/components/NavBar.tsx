import { Link } from 'react-router-dom';

/** The screens reachable from the bottom bar, in tab order. */
const TABS = [
  { to: '/wardrobe', label: 'WARDROBE' },
  { to: '/try-on', label: 'ON YOU' },
  { to: '/stats', label: 'STATS' },
] as const;

export type Tab = (typeof TABS)[number]['to'];

/** The monitor's bottom bar: the tabs, then MENU on the right. */
export function MonitorNav({ current }: { current: Tab }) {
  return (
    <nav className="cats" aria-label="Navigation">
      {TABS.map((t) =>
        t.to === current ? (
          <Link key={t.to} to={t.to} className="on" aria-current="page">
            {t.label}
          </Link>
        ) : (
          <Link key={t.to} to={t.to}>
            {t.label}
          </Link>
        ),
      )}
      <span className="spacer" />
      <Link to="/" className="more">
        MENU
      </Link>
    </nav>
  );
}

/** The handheld's bottom-bar links: MENU plus every tab except the current one. */
export function PocketNavLinks({ current }: { current: Tab }) {
  return (
    <nav className="pk-bar-links" aria-label="Navigation">
      <Link className="pk-menu" to="/">
        MENU
      </Link>
      {TABS.filter((t) => t.to !== current).map((t) => (
        <Link key={t.to} className="pk-menu" to={t.to}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
