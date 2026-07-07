import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="font-serif text-2xl text-text">Not found</p>
      <p className="text-text-muted">There's no entry at this address.</p>
      <Link
        to="/"
        className="text-clay-600 underline hover:text-clay-700 dark:text-clay-300"
      >
        Back to the atlas
      </Link>
    </div>
  );
}
