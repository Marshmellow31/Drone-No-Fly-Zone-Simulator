import React from 'react';
import { SimulationState } from '../types';
import { PlayIcon, PauseIcon, FastForwardIcon } from './icons';

interface ControlsProps {
  simulationState: SimulationState;
  onPlay: () => void;
  onPause: () => void;
  onSetSpeed: (speed: number) => void;
  onScenarioChange: (scenario: string) => void;
  scenarios: string[];
}

// FIX: The component was defined with an inline prop type that didn't account for React's special `key` prop.
// By defining props in an interface and using React.FC, TypeScript understands
// this is a React component and allows the `key` prop when used in a list.
interface ControlButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({ onClick, children, active = false }) => {
  const baseClasses = "px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-center gap-2 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const activeClasses = active ? "bg-cyan-500 text-white shadow-lg" : "bg-gray-700 text-gray-300 hover:bg-gray-600";
  return (
    <button onClick={onClick} className={`${baseClasses} ${activeClasses}`}>
      {children}
    </button>
  );
};

export default function Controls({ simulationState, onPlay, onPause, onSetSpeed, onScenarioChange, scenarios }: ControlsProps) {
  const speedOptions = [0.5, 1, 2, 5];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {!simulationState.isPlaying ? (
          <button onClick={onPlay} className="p-3 bg-green-600 hover:bg-green-500 rounded-full text-white transition-colors duration-200 shadow-lg">
            <PlayIcon className="w-6 h-6" />
          </button>
        ) : (
          <button onClick={onPause} className="p-3 bg-yellow-600 hover:bg-yellow-500 rounded-full text-white transition-colors duration-200 shadow-lg">
            <PauseIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg">
        <span className="text-sm font-medium text-gray-400 pl-2 flex items-center gap-1"><FastForwardIcon className="w-4 h-4" /> Speed:</span>
        {speedOptions.map(speed => (
          <ControlButton key={speed} onClick={() => onSetSpeed(speed)} active={simulationState.speedMultiplier === speed}>
            x{speed}
          </ControlButton>
        ))}
      </div>
      
      <div>
        <select 
          onChange={(e) => onScenarioChange(e.target.value)} 
          className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          defaultValue="normal"
        >
          {scenarios.map(scenarioName => (
            <option key={scenarioName} value={scenarioName}>
              Scenario: {scenarioName.charAt(0).toUpperCase() + scenarioName.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}