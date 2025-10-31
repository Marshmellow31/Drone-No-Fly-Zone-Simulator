
import { Scenario } from './types';

export const MAP_WIDTH = 1000; // meters
export const MAP_HEIGHT = 1000; // meters
export const SIMULATION_TICK_MS = 100; // Update every 100ms

export const SCENARIOS: { [key: string]: Scenario } = {
  normal: {
    name: "Normal Approach",
    initialTelemetry: {
      id: "DR-001",
      position: { x: 50, y: 50 },
      altitude: 100,
      speed: 25, // m/s
      heading: 45, // degrees
      signalStrength: -60,
      battery: 100,
      timestamp: Date.now(),
    },
    geofence: {
      center: { x: 500, y: 500 },
      radius: 200,
    },
  },
  breach: {
    name: "Imminent Breach",
    initialTelemetry: {
      id: "DR-002",
      position: { x: 200, y: 200 },
      altitude: 120,
      speed: 30, // m/s
      heading: 45,
      signalStrength: -55,
      battery: 100,
      timestamp: Date.now(),
    },
    geofence: {
      center: { x: 500, y: 500 },
      radius: 250,
    },
  },
  spoofing: {
    name: "GPS Spoofing Demo",
    initialTelemetry: {
      id: "DR-003",
      position: { x: 800, y: 800 },
      altitude: 90,
      speed: 20,
      heading: 225,
      signalStrength: -70,
      battery: 100,
      timestamp: Date.now(),
    },
    geofence: {
      center: { x: 400, y: 400 },
      radius: 150,
    },
    // Special logic in simulator will handle the "jump"
  },
};