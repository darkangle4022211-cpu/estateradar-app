// EstateRadar Real-Time Telemetry Driver
// Zero Dummy Data — Only monitors active clocked-in employees with real or simulated movement if requested
import { state } from './state.js';

class SimulatorEngine {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
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

  loop() {
    if (!this.isRunning) return;

    // Real device geolocation if employee is clocked in
    if (state.currentUser && state.currentUser.isClockedIn && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          state.updateCurrentGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            accuracy: pos.coords.accuracy
          });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    this.intervalId = setTimeout(() => this.loop(), 5000);
  }
}

export const simulator = new SimulatorEngine();
export const HAMZA_FULL_DAY_ROUTE = [];
