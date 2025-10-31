
import React from 'react';
import { WarningIcon } from './icons';

interface SafetyNoticeModalProps {
  onClose: () => void;
}

export default function SafetyNoticeModal({ onClose }: SafetyNoticeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-yellow-500 rounded-lg p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-start gap-4">
          <WarningIcon className="w-12 h-12 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Important Safety & Ethics Notice</h2>
            <p className="text-gray-300 mb-4">
              This application is a **simulation only**. It is designed for demonstration and educational purposes to visualize drone geofencing concepts.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
              <li>This app **does not** interact with, control, or communicate with any real drones or hardware.</li>
              <li>It **does not** perform any form of GPS spoofing, radio signal manipulation, or network interference.</li>
              <li>All "mitigation actions" are purely simulated and only affect the state of this local application. They do not represent real-world capabilities.</li>
              <li>The use of drone detection and mitigation technology is subject to strict legal and ethical regulations. Unauthorized use can be dangerous and illegal.</li>
            </ul>
            <button
              onClick={onClose}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
