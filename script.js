document.getElementById('payButton').addEventListener('click', async () => {
    const customerName = document.getElementById('customerName').value.trim();
    const destination = document.getElementById('destination').value;

    if (!customerName || !destination) {
        displayMessage('Please fill in all the details.', 'error');
        return;
    }

    // Generate UPI QR Code
    const upiId = 'yashwanth.devulapalli-1@okaxis'; // Replace with your UPI ID
    const amount = 10; // Amount in INR
    const upiUrl = `upi://pay?pa=${upiId}&pn=${customerName}&am=${amount}&cu=INR`;

    generateQRCode(upiUrl);
    document.getElementById('paymentMethods').style.display = 'block';
    document.getElementById('transactionSection').style.display = 'block';

    // Generate and display a random transaction ID
    const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
    localStorage.setItem('transactionId', transactionId);
    document.getElementById('generatedTransactionId').innerText = `Transaction ID: ${transactionId}`;
});

document.getElementById('submitTransactionId').addEventListener('click', async () => {
    const customerName = document.getElementById('customerName').value.trim();
    const transactionId = document.getElementById('transactionId').value.trim();
    const storedTransactionId = localStorage.getItem('transactionId');
    const destination = document.getElementById('destination').value.trim(); // Get destination

    if (!transactionId || !destination) { // Ensure destination is provided
        displayMessage('Please enter the transaction ID and destination.', 'error');
        return;
    }

    if (transactionId !== storedTransactionId) {
        displayMessage('Invalid transaction ID.', 'error');
        return;
    }

    // Send transaction ID and destination to the server
    try {
        const response = await fetch('http://localhost:5000/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: customerName,
                transactionId: transactionId,
                destination: destination,  // Include destination
                status: 'Paid'
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error Response:', errorData);
            throw new Error('Failed to process the booking.');
        }

        // Process the booking
        processBooking(customerName);
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
});

document.getElementById('statusButton').addEventListener('click', () => {
    const customerName = document.getElementById('customerName').value.trim();
    const startingPoint = 'BVRIT College';
    const destination = document.getElementById('destination').value;

    if (!customerName || !destination) {
        displayMessage('Please fill in all the details.', 'error');
        return;
    }

    const trackingWindow = window.open('tracking.html', 'TrackingWindow', 'width=800,height=600');
    trackingWindow.onload = () => {
        trackingWindow.document.getElementById('trackingName').innerText = customerName;
        trackingWindow.document.getElementById('trackingStart').innerText = startingPoint;
        trackingWindow.document.getElementById('trackingDestination').innerText = destination;
    };
});

document.getElementById('fetchData').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:5000/get_bookings');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const bookings = await response.json();
        const dataDisplay = document.getElementById('dataDisplay');
        dataDisplay.innerHTML = JSON.stringify(bookings, null, 2);
    } catch (error) {
        console.error('Failed to fetch:', error);
        displayMessage('Failed to retrieve booking data.', 'error');
    }
});

async function processBooking(customerName) {
    try {
        const response = await fetch('http://localhost:5000/get_bookings');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const bookings = await response.json();
        console.log('Bookings:', bookings); // Log the bookings for debugging

        const booking = bookings.find(b => b.name === customerName);
        if (booking && booking.status === 'Paid') {
            playVoiceMessage('POD is booked successfully');
            document.getElementById('bookingInfo').style.display = 'block';
            document.getElementById('statusButton').style.display = 'block';

            // ✅ Auto-start the POD after booking
            startPodAutomatically(customerName);
        }

    } catch (error) {
        console.error('Failed to fetch:', error);
        displayMessage('Error fetching booking details.', 'error');
    }
}

function generateQRCode(url) {
    const qrCodeElement = document.getElementById('qrCode');
    qrCodeElement.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200`;
}

function displayMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerText = message;
    document.body.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function playVoiceMessage(message) {
    const speech = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(speech);
}

// ✅ Automatically start the POD after booking confirmation
async function startPodAutomatically(customerName) {
    try {
        const response = await fetch('http://localhost:5000/get_bookings');
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const bookings = await response.json();
        const booking = bookings.find(b => b.name === customerName);

        if (!booking) {
            displayMessage('Booking not found for auto-start.', 'error');
            return;
        }

        const podData = {
            booking_id: booking.booking_id || Math.random().toString(36).substr(2, 9).toUpperCase(),
            pod_id: booking.pod_id || 'U-POD-001',
            user_id: booking.user_id || 'USER-' + Math.floor(Math.random() * 10000),
            isBooked: true,
            Start_location: 'BVRIT College',
            Destination: booking.destination,
            status: 'In Progress',
            payment_status: 'Paid',
            transaction_id: booking.transactionId,
            pod_status: 'Active',
            speed_kmph: 10
        };

        const startResponse = await fetch('http://localhost:5000/start_pod', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(podData)
        });

        if (!startResponse.ok) {
            const errorData = await startResponse.json();
            console.error('Start POD Error:', errorData);
            displayMessage('Failed to start POD.', 'error');
            return;
        }

        displayMessage('POD started automatically!', 'success');
    } catch (error) {
        console.error('startPodAutomatically error:', error);
        displayMessage('Something went wrong while starting POD.', 'error');
    }
}