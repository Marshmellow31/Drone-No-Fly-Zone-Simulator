
import React from 'react';
import { DroneTelemetry } from '../types';

interface TelemetryPanelProps {
  telemetry: DroneTelemetry;
}

const TelemetryItem = ({ label, value, unit }: { label: string; value: string | number; unit: string }) => (
  <div className="flex justify-between items-baseline text-gray-300">
    <span className="text-sm font-medium text-gray-400">{label}</span>
    <span className="font-mono text-lg font-semibold text-white">
      {value} <span className="text-xs text-gray-500">{unit}</span>
    </span>
  </div>
);

export default function TelemetryPanel({ telemetry }: TelemetryPanelProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-md font-semibold text-gray-200 mb-3">Drone Telemetry ({telemetry.id})</h3>
      <div className="space-y-2">
        <TelemetryItem label="Position X" value={telemetry.position.x.toFixed(0)} unit="m" />
        <TelemetryItem label="Position Y" value={telemetry.position.y.toFixed(0)} unit="m" />
        <TelemetryItem label="Altitude" value={telemetry.altitude} unit="m" />
        <TelemetryItem label="Speed" value={telemetry.speed.toFixed(1)} unit="m/s" />
        <TelemetryItem label="Heading" value={`${telemetry.heading.toFixed(0)}°`} unit="" />
        <TelemetryItem label="Signal" value={telemetry.signalStrength} unit="dBm" />
      </div>
    </div>
  );
}
