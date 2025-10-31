import { useState, useEffect, useRef, useCallback } from 'react';
import { DroneTelemetry, Geofence, SimulationState, BreachState, LogEntry, Scenario, Point } from '../types';
import { SIMULATION_TICK_MS, MAP_WIDTH, MAP_HEIGHT } from '../constants';

export const useTelemetrySimulator = (initialScenario: Scenario) => {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(initialScenario.initialTelemetry);
  const [geofence, setGeofence] = useState<Geofence>(initialScenario.geofence);
  const [simulationState, setSimulationState] = useState<SimulationState>({ isPlaying: false, speedMultiplier: 1 });
  const [breachState, setBreachState] = useState<BreachState>({ isBreached: false, eta: null, distance: Infinity });
  const [log, setLog] = useState<LogEntry[]>([]);

  const intervalRef = useRef<number | null>(null);
  const simulationTimeRef = useRef<number>(0);

  const addLogEntry = useCallback((message: string, type: LogEntry['type']) => {
    setLog(prevLog => [...prevLog, { timestamp: Date.now(), message, type }]);
  }, []);

  const resetState = useCallback((newScenario: Scenario) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScenario(newScenario);
    setTelemetry(newScenario.initialTelemetry);
    setGeofence(newScenario.geofence);
    setSimulationState({ isPlaying: false, speedMultiplier: 1 });
    setBreachState({ isBreached: false, eta: null, distance: Infinity });
    setLog([]);
    simulationTimeRef.current = 0;
    addLogEntry(`Scenario loaded: "${newScenario.name}"`, 'INFO');
  }, [addLogEntry]);

  const updateSimulation = useCallback(() => {
    setTelemetry(prevTel => {
      let { position, heading, speed } = prevTel;
      const effectiveSpeed = speed * simulationState.speedMultiplier;

      // Special logic for spoofing scenario
      if (scenario.name === "GPS Spoofing Demo") {
        simulationTimeRef.current += SIMULATION_TICK_MS;
        if (simulationTimeRef.current > 5000 && simulationTimeRef.current < 5200) {
          addLogEntry("Anomalous GPS jump detected!", 'WARNING');
          position = { x: 350, y: 350 }; // The "jump"
          simulationTimeRef.current = 5201; // prevent re-jumping
        }
      }

      const headingRad = (heading - 90) * (Math.PI / 180);
      const deltaX = Math.cos(headingRad) * effectiveSpeed * (SIMULATION_TICK_MS / 1000);
      const deltaY = Math.sin(headingRad) * effectiveSpeed * (SIMULATION_TICK_MS / 1000);

      let newX = position.x + deltaX;
      let newY = position.y + deltaY;

      // Boundary collision detection (bounce off walls)
      // A collision with a vertical wall (left/right) reflects the horizontal velocity component.
      if (newX < 0 || newX > MAP_WIDTH) {
        heading = 360 - heading;
        newX = Math.max(0, Math.min(MAP_WIDTH, newX));
      }
      // A collision with a horizontal wall (top/bottom) reflects the vertical velocity component.
      if (newY < 0 || newY > MAP_HEIGHT) {
        heading = 180 - heading;
        newY = Math.max(0, Math.min(MAP_HEIGHT, newY));
      }
      
      return {
        ...prevTel,
        position: { x: newX, y: newY },
        heading: (heading + 360) % 360,
        timestamp: Date.now(),
      };
    });

    // Geofence Breach Detection
    setTelemetry(currentTelemetry => {
      const dx = currentTelemetry.position.x - geofence.center.x;
      const dy = currentTelemetry.position.y - geofence.center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const isBreached = distance <= geofence.radius;
      let eta: number | null = null;
      if (!isBreached) {
        const speed = currentTelemetry.speed * simulationState.speedMultiplier;
        if (speed > 0) {
            const distanceToEdge = distance - geofence.radius;
            eta = distanceToEdge / speed;
        }
      }

      setBreachState(prevBreachState => {
        if (isBreached && !prevBreachState.isBreached) {
          addLogEntry(`GEOFENCE BREACH! Drone ${currentTelemetry.id} entered restricted zone.`, 'WARNING');
        } else if (!isBreached && distance < geofence.radius * 1.5 && prevBreachState.eta === null) {
            addLogEntry(`Drone ${currentTelemetry.id} approaching restricted zone.`, 'INFO');
        }
        return { isBreached, eta, distance };
      });
      return currentTelemetry;
    });

  }, [geofence, simulationState.speedMultiplier, addLogEntry, scenario.name]);
  
  useEffect(() => {
    if (simulationState.isPlaying) {
      intervalRef.current = window.setInterval(updateSimulation, SIMULATION_TICK_MS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationState.isPlaying, updateSimulation]);


  const controls = {
    play: () => {
        setSimulationState(s => ({ ...s, isPlaying: true }));
        addLogEntry("Simulation started.", 'INFO');
    },
    pause: () => {
        setSimulationState(s => ({ ...s, isPlaying: false }));
        addLogEntry("Simulation paused.", 'INFO');
    },
    setSpeed: (multiplier: number) => {
        setSimulationState(s => ({ ...s, speedMultiplier: multiplier }));
        addLogEntry(`Simulation speed set to x${multiplier}.`, 'INFO');
    },
    loadScenario: (newScenario: Scenario) => {
      resetState(newScenario);
    },
    logMitigationAction: (action: string) => {
        addLogEntry(`Mitigation action taken: ${action}`, 'ACTION');
        if (action.includes("Divert")) {
             setTelemetry(t => ({...t, heading: (t.heading + 90) % 360}));
        }
    }
  };

  return { telemetry, simulationState, breachState, log, geofence, controls };
};