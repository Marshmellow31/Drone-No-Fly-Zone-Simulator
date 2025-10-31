
import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Controls from './components/Controls';
import AlertPanel from './components/AlertPanel';
import LogPanel from './components/LogPanel';
import TelemetryPanel from './components/TelemetryPanel';
import SafetyNoticeModal from './components/SafetyNoticeModal';
import { useTelemetrySimulator } from './hooks/useTelemetrySimulator';
import { SCENARIOS } from './constants';
import { DroneIcon, WarningIcon } from './components/icons';

export default function App() {
  const {
    telemetry,
    friendlyDrones,
    simulationState,
    breachState,
    log,
    geofence,
    controls,
  } = useTelemetrySimulator(SCENARIOS.normal);

  const [showSafetyNotice, setShowSafetyNotice] = useState(true);

  useEffect(() => {
    // Preload drone icon to avoid flicker
    const img = new Image();
    img.src = '/drone-icon.svg';
  }, []);

  const handleScenarioChange = (scenarioName: string) => {
    const newScenario = SCENARIOS[scenarioName];
    if (newScenario) {
      controls.loadScenario(newScenario);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans overflow-hidden">
      {showSafetyNotice && <SafetyNoticeModal onClose={() => setShowSafetyNotice(false)} />}
      
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-2 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <DroneIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">Drone No-Fly Zone Simulator</h1>
          </div>
          <div className="bg-red-500/80 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 shadow-lg">
            <WarningIcon className="w-4 h-4" />
            SIMULATION MODE — NO REAL DRONE INTERACTION
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Map and Controls Wrapper */}
        <div className="flex-[3] lg:flex-1 flex flex-col gap-4 min-h-0">
          <Map telemetry={telemetry} friendlyDrones={friendlyDrones} geofence={geofence} breachState={breachState} />
          <Controls
            simulationState={simulationState}
            onPlay={controls.play}
            onPause={controls.pause}
            onSetSpeed={controls.setSpeed}
            onScenarioChange={handleScenarioChange}
            scenarios={Object.keys(SCENARIOS)}
          />
        </div>

        {/* Info Panels Wrapper */}
        <aside className="flex-1 lg:flex-none lg:w-[400px] w-full flex flex-col gap-4 overflow-y-auto min-h-0">
          {breachState.isBreached && <AlertPanel breachState={breachState} onMitigate={controls.logMitigationAction} />}
          <TelemetryPanel telemetry={telemetry} />
          <LogPanel log={log} />
        </aside>
      </main>
    </div>
  );
}