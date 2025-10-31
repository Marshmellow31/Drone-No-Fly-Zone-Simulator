
import React, { useState } from 'react';
import { DroneTelemetry, Geofence, BreachState } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

interface MapProps {
  telemetry: DroneTelemetry;
  geofence: Geofence;
  breachState: BreachState;
}

// InfoWindow to display telemetry details on click
const InfoWindow = ({ telemetry }: { telemetry: DroneTelemetry }) => {
  const { position, id, altitude, speed, heading, signalStrength } = telemetry;
  const left = (position.x / MAP_WIDTH) * 100;
  const top = (position.y / MAP_HEIGHT) * 100;

  return (
    <div
      className="absolute bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3 w-48 text-xs text-gray-300 shadow-xl z-30"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        // Position the window above and to the right of the drone icon
        transform: 'translate(30px, -110%)',
      }}
    >
      <div className="font-bold text-cyan-400 mb-2 border-b border-gray-700 pb-1">ID: {id}</div>
      <div className="space-y-1 font-mono">
        <p><span className="font-semibold text-gray-400">Pos:</span> {position.x.toFixed(0)}m, {position.y.toFixed(0)}m</p>
        <p><span className="font-semibold text-gray-400">Alt:</span> {altitude}m</p>
        <p><span className="font-semibold text-gray-400">Speed:</span> {speed.toFixed(1)}m/s</p>
        <p><span className="font-semibold text-gray-400">Hdg:</span> {heading.toFixed(0)}°</p>
        <p><span className="font-semibold text-gray-400">Signal:</span> {signalStrength}dBm</p>
      </div>
       {/* Arrow pointing down-left */}
      <div className="absolute left-4 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-600" />
    </div>
  );
};


const Drone = React.memo(({ telemetry, onClick }: { telemetry: DroneTelemetry; onClick: (e: React.MouseEvent) => void }) => {
  const { position, heading } = telemetry;
  const left = (position.x / MAP_WIDTH) * 100;
  const top = (position.y / MAP_HEIGHT) * 100;

  return (
    <button
      onClick={onClick}
      aria-label={`Show telemetry for drone ${telemetry.id}`}
      className="absolute w-8 h-8 transition-all duration-100 ease-linear z-20 cursor-pointer p-0 border-none bg-transparent"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${heading}deg)`,
      }}
    >
      {/* The inner SVG is not rotated again, the parent button handles it */}
      <svg viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 drop-shadow-lg w-full h-full">
        <path d="M12,2L6,7.1V12.5C6,13.1,6.4,13.7,7,13.8L11,15V22H13V15L17,13.8C17.6,13.7,18,13.1,18,12.5V7.1L12,2Z" />
      </svg>
    </button>
  );
});

const GeofenceCircle = React.memo(({ geofence, isBreached }: { geofence: Geofence; isBreached: boolean }) => {
  const radiusPercent = (geofence.radius / MAP_WIDTH) * 100;
  const left = (geofence.center.x / MAP_WIDTH) * 100;
  const top = (geofence.center.y / MAP_HEIGHT) * 100;

  const breachClasses = isBreached 
    ? 'bg-red-500/30 border-red-500 animate-pulse'
    : 'bg-yellow-500/20 border-yellow-500';

  return (
    <div
      className={`absolute rounded-full border-2 border-dashed transition-colors duration-300 ${breachClasses}`}
      style={{
        width: `${radiusPercent * 2}%`,
        height: `${radiusPercent * 2}%`,
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
});

export default function Map({ telemetry, geofence, breachState }: MapProps) {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  const handleDroneClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the map's click handler from firing
    setShowInfoWindow(current => !current);
  };

  const handleMapClick = () => {
    if (showInfoWindow) {
      setShowInfoWindow(false);
    }
  };

  return (
    <div 
        className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-inner"
        onClick={handleMapClick}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
        {[...Array(100)].map((_, i) => (
          <div key={i} className="border-r border-b border-gray-700/50"></div>
        ))}
      </div>
      
      <GeofenceCircle geofence={geofence} isBreached={breachState.isBreached} />
      
      {/* Conditionally render InfoWindow */}
      {showInfoWindow && <InfoWindow telemetry={telemetry} />}
      
      <Drone telemetry={telemetry} onClick={handleDroneClick} />
    </div>
  );
}