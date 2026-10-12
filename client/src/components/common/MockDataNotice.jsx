import { FlaskConical } from 'lucide-react';

/** Shown on any block that renders data from src/mocks (i.e. not yet backed by the API). */
export default function MockDataNotice({ children = 'Sample data — this section is not connected to the API yet.' }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
      <FlaskConical className="h-3.5 w-3.5" /> {children}
    </div>
  );
}
