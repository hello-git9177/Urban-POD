const { ipcRenderer } = require('electron');

document.getElementById('fetchData').addEventListener('click', () => {
    ipcRenderer.send('fetch-data');
});

ipcRenderer.on('data', (event, data) => {
    let bookingsDisplay = '<h3>All Bookings</h3>';
    data.forEach(booking => {
        bookingsDisplay += `
            <p>
                Name: ${booking.name}, Starting Point: ${booking.startingPoint},
                Destination: ${booking.destination}, Status: ${booking.status}
            </p>`;
    });
    document.getElementById('dataDisplay').innerHTML = bookingsDisplay;
});

