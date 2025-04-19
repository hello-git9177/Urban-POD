from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, db as realtime_db
import logging
import random
import string

app = Flask(__name__)
CORS(app)

# ---------- Initialize Firebase Admin SDK ----------
cred = credentials.Certificate('firebase-service-key.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://pod-communication-b0d6e-default-rtdb.firebaseio.com/'  
})

# ---------- Firestore Collection ----------
db = firestore.client()
bookings_collection = db.collection('bookings')

# ---------- Logging Setup ----------
logging.basicConfig(level=logging.INFO)

# ---------------- OLD ROUTES ----------------


@app.route('/booking', methods=['POST'])
def book_pod():
    data = request.json
    try:
        bookings_collection.add(data)
        return jsonify({'message': 'Booking successful'}), 201
    except Exception as booking_error:
        logging.error(f'Error processing booking: {booking_error}')
        return jsonify({'error': 'Booking failed'}), 500


@app.route('/get_bookings', methods=['GET'])
def get_bookings():
    try:
        bookings = [doc.to_dict() for doc in bookings_collection.stream()]
        return jsonify(bookings), 200
    except Exception as get_bookings_error:
        logging.error(f'Error retrieving bookings: {get_bookings_error}')
        return jsonify({'error': 'Failed to retrieve bookings'}), 500


@app.route('/track_health', methods=['GET'])
def track_health():
    track_health_info = {
        'health': 100,
        'location': 'BVRIT College to Miyapur'
    }
    return jsonify(track_health_info)


@app.route('/favicon.ico')
def favicon():
    return '', 204


@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the home page'})


# ---------------- NEW ROUTE: Start POD ----------------

@app.route('/start_pod', methods=['POST'])
def start_pod():
    try:
        data = request.json
        required_fields = ['booking_id', 'pod_id', 'user_id', 'isBooked', 'Start_location',
                           'Destination', 'status', 'payment_status', 'transaction_id', 'pod_status', 'speed_kmph']

        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Auto-fill optional fields if not provided
        def generate_id(prefix):
            return prefix + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        if not data.get('booking_id'):
            data['booking_id'] = generate_id('BOOK-')

        if not data.get('pod_id'):
            data['pod_id'] = 'U-POD-001'

        if not data.get('user_id'):
            data['user_id'] = generate_id('USER-')

        if not data.get('speed_kmph'):
            data['speed_kmph'] = 10  # Default speed if not provided

        # Add booking to Firestore
        bookings_collection.add(data)

        # Push to Realtime Database for ESP32
        esp_data = {
            'isBooked': data['isBooked'],
            'payment_status': data['payment_status'],
            'pod_id': data['pod_id'],
            'speed_kmph': data['speed_kmph'],
            'start': data['Start_location'],
            'destination': data['Destination']
        }

        realtime_db.reference('/esp32_commands/latest_booking').set(esp_data)

        logging.info('U-POD booking saved and pushed to ESP32.')
        return jsonify({'message': 'POD movement triggered'}), 201

    except Exception as error:
        logging.error(f'Error creating U-POD movement: {error}')
        return jsonify({'error': 'Failed to trigger U-POD movement'}), 500


# ---------------- RUN SERVER ----------------

if __name__ == '__main__':
    app.run(debug=True)
