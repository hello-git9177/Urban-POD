**U-TAP POD Autonomous Smart Mobility System**
An AI-powered autonomous vehicle system for smart campus mobility. Featuring real-time booking, Firebase cloud integration, IR sensor-based navigation, LoRa-based inter-vehicle communication, and a full-featured admin dashboard with live control, analytics, and a Digital Twin environment.

**Features**
  1. User Booking System: Passengers can book rides via mobile or dashboard, submitting start location, destination, and speed preferences. Only after successful payment (payment_status:      "paid"), the system triggers vehicle assignment.
  2. Firebase Realtime Database Integration: All bookings, pod movements, speed commands, and trip logs are stored and synced in real-time with Firebase. Vehicle logic fetches and             updates Firebase at each stage of the journey.
  3. IR Sensor-Based Navigation: The vehicles follow a predefined route using IR sensors to detect Depot, Station 1, and Station 2. Each move between stations is triggered only by IR          input — no GPS used.
  4. Speed Control via Dashboard: The vehicle stops after each sensor trigger and waits until the admin sends a new speed command via Firebase before continuing.
  5. AI-Powered LoRa Communication: U-POD and TAP-POD communicate using LoRa to share journey stages. TAP-POD intelligently starts and follows U-POD using platooning logic for                 collaborative mobility.
  6. Real-Time Admin Dashboard: Built with Firebase, JavaScript, and HTML/CSS — the dashboard displays live location on a 5x4 ft map layout, allows speed control, and logs all journey         activity. Includes charts, trip duration analytics, IR logs, and speed usage graphs.
  7. Digital Twin with Node-RED + Three.js: A virtual 3D twin of the physical pod system, showing real-time movements and stages. Useful for simulations, diagnostics, and futuristic           interfaces.

**Tech Stack**
Component	Technology
  1. Microcontroller - ESP32
  2. Backend Database - Firebase Realtime Database
  3. Communication - LoRa (AI-enabled module)
  4. Frontend Dashboard - HTML, CSS, JS + Firebase SDK
  5. Digital Twin - Node-RED, Three.js
  6. Sensors - IR Sensors
  7. Motor Control - Full H-Bridge using IN1–IN4 pins

**How It Works**
  1. Booking: User books a pod from mobile/web app → data is stored in Firebase.
  2. Validation: Vehicle fetches booking info (start, end, speed) from Firebase.
  3. Movement: Pod waits for IR trigger at each station → dashboard sends speed → pod moves.
  4. Platooning: U-POD sends journey info via LoRa → TAP-POD follows with adjusted speed.
  5. Dashboard: Admin monitors live journey, sends commands, and views analytics.
  6. Digital Twin: Shows real-time vehicle activity in a virtual 3D environment.

**Analytics Dashboard Includes**
  1. Trip durations and daily trip counts
  2. Station-wise time spent
  3. Speed usage graphs
  4. IR sensor trigger logs
  5. Real-time vehicle status indicators
  6. Optional alerts and heatmap system
