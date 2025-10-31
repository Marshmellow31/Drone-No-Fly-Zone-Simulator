
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { DownloadIcon } from './icons';

interface LogPanelProps {
  log: LogEntry[];
}

const getTypeClasses = (type: LogEntry['type']) => {
  switch (type) {
    case 'INFO': return 'text-gray-400';
    case 'WARNING': return 'text-yellow-400 font-semibold';
    case 'ACTION': return 'text-cyan-400 font-semibold';
    default: return 'text-gray-400';
  }
};

const exportToCSV = (log: LogEntry[]) => {
  const headers = "Timestamp,Type,Message\n";
  const rows = log.map(entry => {
    const date = new Date(entry.timestamp).toISOString();
    const message = `"${entry.message.replace(/"/g, '""')}"`;
    return [date, entry.type, message].join(',');
  }).join('\n');
  
  const csvContent = headers + rows;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `drone-sim-log-${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default function LogPanel({ log }: LogPanelProps) {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col flex-1 min-h-0">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold text-gray-200">Event Log</h3>
        <button 
          onClick={() => exportToCSV(log)}
          className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium py-1 px-3 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <DownloadIcon className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      <div ref={logContainerRef} className="flex-1 overflow-y-auto bg-gray-900/50 rounded p-2 text-sm font-mono space-y-1">
        {log.map((entry, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            <span className={getTypeClasses(entry.type)}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
