import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface Props {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const detectedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const scannerId = 'barcode-scanner-region';
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 280, height: 140 } },
      (decodedText) => {
        if (detectedRef.current) return;
        detectedRef.current = true;
        scanner.stop().catch(() => {});
        onDetected(decodedText);
      },
      () => {},
    ).catch(() => {
      // Camera permission denied or unavailable
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-60 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-10 pb-4">
        <div className="flex items-center gap-2 text-white">
          <Camera size={20} />
          <span className="font-semibold">Scan Barcode</span>
        </div>
        <button type="button" onClick={onClose} className="text-white p-2">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div id="barcode-scanner-region" ref={containerRef} className="w-full max-w-sm rounded-2xl overflow-hidden" />
        <p className="text-white/60 text-sm mt-6 text-center">
          Point camera at a product barcode
        </p>
      </div>

      <div className="px-4 pb-10">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl text-white font-medium"
          style={{ background: '#0F1525', border: '1px solid #1F2D50' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
