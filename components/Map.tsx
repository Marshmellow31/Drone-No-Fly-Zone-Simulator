import React, { useState } from 'react';
import { DroneTelemetry, Geofence, BreachState } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { SpeedometerIcon, CompassIcon } from './icons';

interface MapProps {
  telemetry: DroneTelemetry;
  friendlyDrones: DroneTelemetry[];
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
      <div className="font-bold text-red-400 mb-2 border-b border-gray-700 pb-1">ID: {id}</div>
      <div className="space-y-1 font-mono">
        <p><span className="font-semibold text-gray-400">Pos:</span> {position.x.toFixed(0)}m, {position.y.toFixed(0)}m</p>
        <p><span className="font-semibold text-gray-400">Alt:</span> {altitude}m</p>
        <div className="flex items-center gap-2">
            <SpeedometerIcon className="w-4 h-4 text-gray-500" />
            <span><span className="font-semibold text-gray-400">Speed:</span> {speed.toFixed(1)}m/s</span>
        </div>
        <div className="flex items-center gap-2">
            <CompassIcon className="w-4 h-4 text-gray-500" />
            <span><span className="font-semibold text-gray-400">Hdg:</span> {heading.toFixed(0)}°</span>
        </div>
        <p><span className="font-semibold text-gray-400">Signal:</span> {signalStrength}dBm</p>
      </div>
       {/* Arrow pointing down-left */}
      <div className="absolute left-4 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-600" />
    </div>
  );
};


const Drone = React.memo(({ telemetry, onClick, color }: { telemetry: DroneTelemetry; onClick: (e: React.MouseEvent) => void; color?: string }) => {
  const { position, heading } = telemetry;
  const left = (position.x / MAP_WIDTH) * 100;
  const top = (position.y / MAP_HEIGHT) * 100;

  return (
    <button
      onClick={onClick}
      aria-label={`Show telemetry for drone ${telemetry.id}`}
      className={`absolute w-8 h-8 transition-all duration-100 ease-linear z-20 p-0 border-none bg-transparent ${onClick !== DUMMY_HANDLER ? 'cursor-pointer' : 'cursor-default'}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${heading}deg)`,
      }}
      disabled={onClick === DUMMY_HANDLER}
    >
      {/* The inner SVG is not rotated again, the parent button handles it */}
      <svg viewBox="0 0 24 24" fill="currentColor" className={`${color || 'text-red-500'} drop-shadow-lg w-full h-full`}>
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

const GeofenceCenter = React.memo(({ geofence }: { geofence: Geofence }) => {
  const left = (geofence.center.x / MAP_WIDTH) * 100;
  const top = (geofence.center.y / MAP_HEIGHT) * 100;

  return (
    <div
      className="absolute w-3 h-3 z-10"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%)',
      }}
      aria-hidden="true"
    >
      <div className="absolute w-full h-full rounded-full bg-yellow-400 animate-ping opacity-75"></div>
      <div className="relative w-full h-full rounded-full bg-yellow-500"></div>
    </div>
  );
});

const DUMMY_HANDLER = () => {};

export default function Map({ telemetry, friendlyDrones, geofence, breachState }: MapProps) {
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
      
      <GeofenceCenter geofence={geofence} />
      <GeofenceCircle geofence={geofence} isBreached={breachState.isBreached} />
      
      {/* Render friendly drones */}
      {friendlyDrones.map(drone => (
        <Drone key={drone.id} telemetry={drone} onClick={DUMMY_HANDLER} color="text-green-400" />
      ))}

      {/* Conditionally render InfoWindow for main drone */}
      {showInfoWindow && <InfoWindow telemetry={telemetry} />}
      
      {/* Main drone - rendered on top */}
      <Drone telemetry={telemetry} onClick={handleDroneClick} />
    </div>
  );
}