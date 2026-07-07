import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-muted">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={14} className="shrink-0 text-text-faint" />}
          {item.to ? (
            <Link to={item.to} className="truncate hover:text-text hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-text">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
