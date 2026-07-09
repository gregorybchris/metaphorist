import { TruckTrailer } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <TruckTrailer
        className="mb-2 h-12 w-12 text-text-muted"
        weight="duotone"
      />
      <p className="font-serif text-2xl text-text">
        This metaphor has broken down.
      </p>
      <p className="text-text-muted">
        We called a tow truck, but it turns out the tow truck was also a
        metaphor.
      </p>
      <Link
        to="/"
        className="mt-1 inline-flex items-center rounded-full bg-clay-600 px-4 py-2 text-sm font-medium text-paper-50 transition-colors hover:bg-clay-700 dark:bg-clay-500 dark:hover:bg-clay-400"
      >
        Hitchhike home
      </Link>
    </div>
  );
}
