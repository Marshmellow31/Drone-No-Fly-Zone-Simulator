
export interface Point {
  x: number;
  y: number;
}

export interface DroneTelemetry {
  id: string;
  position: Point;
  altitude: number; // in meters
  speed: number; // in m/s
  heading: number; // in degrees, 0 is North
  signalStrength: number; // in dBm
  timestamp: number;
}

export interface Geofence {
  center: Point;
  radius: number; // in meters
}

export interface SimulationState {
  isPlaying: boolean;
  speedMultiplier: number; // e.g., 1, 2, 0.5
}

export interface BreachState {
  isBreached: boolean;
  eta: number | null; // Estimated time to arrival in seconds
  distance: number;
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: 'INFO' | 'WARNING' | 'ACTION';
}

export interface Scenario {
  name: string;
  initialTelemetry: DroneTelemetry;
  geofence: Geofence;
  waypoints?: Point[]; // For more complex paths
}
