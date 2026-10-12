// Multi-Agent Route Simulator Engine
import { state } from './state.js';

// Pre-calculated realistic urban road coordinates (Gulberg / Main Blvd / DHA Lahore corridor)
export const HAMZA_FULL_DAY_ROUTE = [
  { lat: 31.5204, lng: 74.3587, speed: 0, heading: 0, time: '09:00 AM', label: 'Office Departure (Clock-in)' },
  { lat: 31.5190, lng: 74.3575, speed: 28, heading: 210, time: '09:05 AM', label: 'Driving down Jail Road' },
  { lat: 31.5170, lng: 74.3550, speed: 42, heading: 215, time: '09:12 AM', label: 'Main Boulevard Gulberg' },
  { lat: 31.5152, lng: 74.3489, speed: 0, heading: 180, time: '09:25 AM', label: 'Stop: Surveyed Plot 42-B (34m stay)' },
  { lat: 31.5135, lng: 74.3510, speed: 32, heading: 130, time: '10:05 AM', label: 'Cruising toward Liberty Roundabout' },
  { lat: 31.5110, lng: 74.3540, speed: 38, heading: 120, time: '10:20 AM', label: 'Crossing Centre Point' },
  { lat: 31.5050, lng: 74.3620, speed: 45, heading: 135, time: '10:35 AM', label: 'Ferozepur Road Flyover' },
  { lat: 31.4980, lng: 74.3750, speed: 52, heading: 110, time: '10:50 AM', label: 'Walton Road Connector' },
  { lat: 31.4850, lng: 74.3900, speed: 40, heading: 125, time: '11:15 AM', label: 'DHA Phase 3 Main Blvd' },
  { lat: 31.4728, lng: 74.4021, speed: 0, heading: 90, time: '11:45 AM', label: 'Stop: Corner Villa 18, Phase 5 (28m stay)' },
  { lat: 31.4700, lng: 74.4080, speed: 30, heading: 85, time: '12:20 PM', label: 'Patrolling Sector C' },
  { lat: 31.4750, lng: 74.4050, speed: 22, heading: 320, time: '12:45 PM', label: 'En Route to Phase 5 Commercial' },
  { lat: 31.4820, lng: 74.3645, speed: 0, heading: 240, time: '01:30 PM', label: 'Stop: Lunch break at Model Town' },
  { lat: 31.5110, lng: 74.3540, speed: 34, heading: 62, time: '02:30 PM', label: 'Current Position (Gulberg III)' }
];

class SimulatorEngine {
  constructor() {
    this.intervalId = null;
    this.currentIndex = 0;
    this.isRunning = false;
    this.speedMultiplier = 1; // 1x, 2x, 5x
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  pause() {
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }

  loop() {
    if (!this.isRunning) return;

    // Check if Hamza is clocked in
    if (state.currentUser.isClockedIn) {
      const point = HAMZA_FULL_DAY_ROUTE[this.currentIndex];
      
      // Calculate realistic jitter and distance step
      const jitterLat = (Math.random() - 0.5) * 0.00015;
      const jitterLng = (Math.random() - 0.5) * 0.00015;
      
      const currentCoords = {
        lat: point.lat + jitterLat,
        lng: point.lng + jitterLng
      };

      const status = point.speed === 0 ? (point.label.includes('Stop') ? 'surveying' : 'idle') : 'moving';
      
      state.updateEmployeePosition(
        'emp_01',
        currentCoords,
        point.speed,
        point.heading,
        point.label,
        status
      );

      // Progress forward along route
      this.currentIndex = (this.currentIndex + 1) % HAMZA_FULL_DAY_ROUTE.length;
    }

    // Also animate Bilal and Usman slightly so the radar looks dynamic and alive
    const bPoint = state.employees.find(e => e.id === 'emp_02');
    if (bPoint && bPoint.status === 'idle') {
      // Bilal stays idle to test the idle warning
    }

    const uPoint = state.employees.find(e => e.id === 'emp_03');
    if (uPoint) {
      const uJitterLat = (Math.random() - 0.5) * 0.0001;
      const uJitterLng = (Math.random() - 0.5) * 0.0001;
      state.updateEmployeePosition(
        'emp_03',
        { lat: uPoint.currentCoords.lat + uJitterLat, lng: uPoint.currentCoords.lng + uJitterLng },
        uPoint.speedKmh,
        uPoint.headingDeg,
        uPoint.currentAddress
      );
    }

    const delay = Math.max(800, 2400 / this.speedMultiplier);
    this.intervalId = setTimeout(() => this.loop(), delay);
  }
}

export const simulator = new SimulatorEngine();
