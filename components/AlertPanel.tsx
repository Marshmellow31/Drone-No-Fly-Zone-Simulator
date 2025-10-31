
import React from 'react';
import { BreachState } from '../types';
import { WarningIcon, BellIcon } from './icons';

interface AlertPanelProps {
  breachState: BreachState;
  onMitigate: (action: string) => void;
}

const MITIGATION_ACTIONS = [
  "Notify Operator",
  "Trigger Audio Warning",
  "Broadcast Warning Message",
  "Divert to Safe Waypoint",
];

export default function AlertPanel({ breachState, onMitigate }: AlertPanelProps) {
  const { isBreached, eta } = breachState;

  const etaDisplay = eta !== null && eta > 0 && eta < 60
    ? `${eta.toFixed(1)}s`
    : '>1 min';

  const title = isBreached ? "GEOFENCE BREACHED" : "PROXIMITY ALERT";
  const message = isBreached 
    ? "Drone has entered a restricted no-fly zone."
    : `Drone will breach geofence in approx. ${etaDisplay}.`;
  
  const panelClasses = isBreached 
    ? 'bg-red-900/50 border-red-500' 
    : 'bg-yellow-900/50 border-yellow-500';

  return (
    <div className={`border rounded-lg p-4 shadow-lg animate-fade-in ${panelClasses}`}>
      <div className="flex items-center gap-3 mb-3">
        <WarningIcon className={`w-8 h-8 ${isBreached ? 'text-red-400' : 'text-yellow-400'}`} />
        <div>
          <h2 className={`text-lg font-bold ${isBreached ? 'text-red-300' : 'text-yellow-300'}`}>{title}</h2>
          <p className="text-sm text-gray-300">{message}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-md font-semibold mb-2 text-gray-200">Suggested Actions:</h3>
        <div className="grid grid-cols-2 gap-2">
          {MITIGATION_ACTIONS.map(action => (
            <button
              key={action}
              onClick={() => onMitigate(action)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <BellIcon className="w-4 h-4"/>
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
