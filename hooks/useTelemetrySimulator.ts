import { useState, useEffect, useRef, useCallback } from 'react';
import { DroneTelemetry, Geofence, SimulationState, BreachState, LogEntry, Scenario, Point } from '../types';
import { SIMULATION_TICK_MS, MAP_WIDTH, MAP_HEIGHT } from '../constants';

const initializeFriendlyDrones = (): DroneTelemetry[] => {
    const drones: DroneTelemetry[] = [];
    for (let i = 0; i < 3; i++) {
      drones.push({
        id: `FR-${String(i + 1).padStart(3, '0')}`,
        position: { x: Math.random() * MAP_WIDTH, y: Math.random() * MAP_HEIGHT },
        altitude: 90 + Math.random() * 20, // 90 to 110
        speed: 10 + Math.random() * 5, // 10 to 15 m/s
        heading: Math.random() * 360,
        signalStrength: -65,
        battery: 100,
        timestamp: Date.now(),
      });
    }
    return drones;
  };

export const useTelemetrySimulator = (initialScenario: Scenario) => {
  const [scenario, setScenario] = useState<Scenario>(initialScenario);
  const [telemetry, setTelemetry] = useState<DroneTelemetry>(initialScenario.initialTelemetry);
  const [friendlyDrones, setFriendlyDrones] = useState<DroneTelemetry[]>([]);
  const [geofence, setGeofence] = useState<Geofence>(initialScenario.geofence);
  const [simulationState, setSimulationState] = useState<SimulationState>({ isPlaying: false, speedMultiplier: 1 });
  const [breachState, setBreachState] = useState<BreachState>({ isBreached: false, eta: null, distance: Infinity });
  const [log, setLog] = useState<LogEntry[]>([]);

  const intervalRef = useRef<number | null>(null);
  const simulationTimeRef = useRef<number>(0);

  const addLogEntry = useCallback((message: string, type: LogEntry['type']) => {
    setLog(prevLog => [...prevLog, { timestamp: Date.now(), message, type }]);
  }, []);

  useEffect(() => {
    setFriendlyDrones(initializeFriendlyDrones());
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
    setFriendlyDrones(initializeFriendlyDrones());
    simulationTimeRef.current = 0;
    addLogEntry(`Scenario loaded: "${newScenario.name}"`, 'INFO');
  }, [addLogEntry]);

  const updateSimulation = useCallback(() => {
    // Update main threat drone
    setTelemetry(prevTel => {
      let { position, heading, speed, battery, altitude, signalStrength } = prevTel;

      // Battery drain simulation
      let newBattery = battery;
      if (newBattery > 0) {
        // Drains in ~3.3 mins at 1x speed. Drain is faster at higher simulation speeds.
        newBattery = Math.max(0, battery - 0.05 * simulationState.speedMultiplier);
        if (newBattery === 0) {
            addLogEntry(`CRITICAL: Drone ${prevTel.id} battery depleted.`, 'WARNING');
        }
      }

      // If battery is dead, the drone stops moving and its speed is set to 0.
      const currentSpeed = newBattery > 0 ? speed : 0;
      const effectiveSpeed = currentSpeed * simulationState.speedMultiplier;

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
      if (newX < 0 || newX > MAP_WIDTH) {
        heading = 360 - heading;
        newX = Math.max(0, Math.min(MAP_WIDTH, newX));
      }
      if (newY < 0 || newY > MAP_HEIGHT) {
        heading = 180 - heading;
        newY = Math.max(0, Math.min(MAP_HEIGHT, newY));
      }

      // Add random fluctuations to altitude and signal strength for realism
      const altitudeFuzz = (Math.random() - 0.5) * 1; // Fluctuate by +/- 0.5m
      const newAltitude = Math.max(80, Math.min(130, altitude + altitudeFuzz)); // Clamp between 80m and 130m

      const signalFuzz = (Math.random() - 0.5) * 2; // Fluctuate by +/- 1dBm
      const newSignalStrength = Math.max(-85, Math.min(-50, signalStrength + signalFuzz)); // Clamp between -85dBm and -50dBm
      
      return {
        ...prevTel,
        position: { x: newX, y: newY },
        speed: currentSpeed,
        battery: newBattery,
        altitude: newAltitude,
        signalStrength: newSignalStrength,
        heading: (heading + 360) % 360,
        timestamp: Date.now(),
      };
    });

    // Update friendly drones
    setFriendlyDrones(prevDrones => prevDrones.map(drone => {
        let { position, heading, speed, battery } = drone;

        // Slower battery drain
        if (battery > 0) {
            battery = Math.max(0, battery - 0.005 * simulationState.speedMultiplier); // 10x slower drain
        }
        const currentSpeed = battery > 0 ? speed : 0;
        const effectiveSpeed = currentSpeed * simulationState.speedMultiplier;

        // Random movement: small random change to heading
        heading += (Math.random() - 0.5) * 10; // +/- 5 degrees change

        const headingRad = (heading - 90) * (Math.PI / 180);
        const deltaX = Math.cos(headingRad) * effectiveSpeed * (SIMULATION_TICK_MS / 1000);
        const deltaY = Math.sin(headingRad) * effectiveSpeed * (SIMULATION_TICK_MS / 1000);

        let newX = position.x + deltaX;
        let newY = position.y + deltaY;

        // Boundary collision detection
        if (newX < 0 || newX > MAP_WIDTH) {
            heading = 360 - heading;
            newX = Math.max(0, Math.min(MAP_WIDTH, newX));
        }
        if (newY < 0 || newY > MAP_HEIGHT) {
            heading = 180 - heading;
            newY = Math.max(0, Math.min(MAP_HEIGHT, newY));
        }

        return {
            ...drone,
            position: { x: newX, y: newY },
            speed: currentSpeed,
            heading: (heading + 360) % 360,
            battery,
            timestamp: Date.now(),
        };
    }));

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
        if (action === "Divert to Safe Waypoint") {
             setTelemetry(t => {
                const { x: droneX, y: droneY } = t.position;
                const { x: centerX, y: centerY } = geofence.center;

                const deltaX = droneX - centerX;
                const deltaY = droneY - centerY;

                // Edge case: if drone is at the exact center, we can't calculate a direction.
                // We'll just send it North as a fallback.
                if (deltaX === 0 && deltaY === 0) {
                    addLogEntry(`Drone at geofence center, diverting North.`, 'INFO');
                    return {...t, heading: 0};
                }

                const angleRad = Math.atan2(deltaY, deltaX);
                const angleDeg = angleRad * (180 / Math.PI);
                
                // Convert cartesian angle to simulation heading (0 is North)
                const newHeading = (angleDeg + 90 + 360) % 360;

                addLogEntry(`Diverting drone ${t.id} to new heading ${newHeading.toFixed(0)}° to exit restricted zone.`, 'INFO');
                return {...t, heading: newHeading};
             });
        }
    }
  };

  return { telemetry, friendlyDrones, simulationState, breachState, log, geofence, controls };
};