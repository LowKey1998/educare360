"use client";

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Prevent multiple initializations in React strict mode
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "isbn-reader",
        { 
          fps: 10, 
          qrbox: { width: 300, height: 150 }, 
          rememberLastUsedCamera: true,
          supportedScanTypes: [0] // 0 configures it to just camera, no file upload for a cleaner UI if desired, but we can leave default
        },
        false
      );

      scannerRef.current.render(
        (text) => {
          onScanSuccess(text);
        },
        (error) => {
          if (onScanError) onScanError(error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div id="isbn-reader" className="w-full mx-auto overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50 shadow-inner" />
  );
}
