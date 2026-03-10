import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize once so render() works (startOnLoad: false so we control when to render)
let mermaidInitialized = false;
function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({ startOnLoad: false });
  mermaidInitialized = true;
}

/**
 * Renders a Mermaid diagram from a definition string.
 */
export function MermaidDiagram({ chart, className = '' }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chart || !containerRef.current) return;

    ensureMermaidInit();
    const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
    setError(null);

    mermaid
      .render(id, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to render diagram');
      });
  }, [chart]);

  if (error) {
    return (
      <div className={`rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 ${className}`}>
        Diagram could not be rendered: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container flex justify-center overflow-x-auto rounded border border-gray-200 bg-gray-50 p-4 [&>svg]:max-w-full ${className}`}
    />
  );
}
