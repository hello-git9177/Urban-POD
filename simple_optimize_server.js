// simple_optimize_server.js

const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

app.post('/optimize_route', (req, res) => {
    try {
        const { start, end } = req.body;
        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end locations are required' });
        }

        const routes = {
            'Miyapur': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.73, 78.25] },
                { name: 'Miyapur', coords: [17.4948, 78.3578] }
            ],
            'Gandimaisamma': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.73, 78.25] },
                { name: 'Gandimaisamma', coords: [17.5402, 78.4583] }
            ],
            'Sangareddy': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.73, 78.25] },
                { name: 'Sangareddy', coords: [17.6248, 78.0820] }
            ],
            'Medchal': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.73, 78.25] },
                { name: 'Medchal', coords: [17.6311, 78.4828] }
            ],
            'NewDestination1': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.74, 78.25] },
                { name: 'NewDestination1', coords: [17.6500, 78.5000] }
            ],
            'NewDestination2': [
                { name: 'BVRIT College', coords: [17.7253, 78.2572] },
                { name: 'Point A', coords: [17.75, 78.25] },
                { name: 'NewDestination2', coords: [17.6600, 78.5100] }
            ]
        };

        const optimizedRoute = routes[end] || [];
        if (optimizedRoute.length === 0) {
            return res.status(404).json({ error: 'No route found for the selected destination' });
        }

        res.json({ optimizedRoute });
    } catch (error) {
        console.error('Error processing /optimize_route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Simple optimize server running at http://localhost:${port}`);
});