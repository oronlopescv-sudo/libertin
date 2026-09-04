import { Loader2 } from 'lucide-react';

export default function Spinner() {
  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
