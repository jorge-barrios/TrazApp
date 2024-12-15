// app/components/exam/ExamDetailsModal.tsx
import { useEffect, useState } from "react";

interface ExamDetailsModalProps {
  examId: string;
  onClose: () => void;
}

export default function ExamDetailsModal({ examId, onClose }: ExamDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CLOSE_MODAL') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('message', handleMessage);
    };
  }, [onClose]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (iframeRef && iframeRef.contentDocument) {
      iframeRef.contentDocument.documentElement.classList.add('dark');
      iframeRef.contentDocument.body.classList.add('bg-gray-900');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-gray-900 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <iframe
            ref={setIframeRef}
            src={`/exams/${examId}?modal=true&theme=dark`}
            className="w-full h-[80vh]"
            style={{
              backgroundColor: '#111827', // bg-gray-900
              border: 'none'
            }}
            onLoad={handleIframeLoad}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}