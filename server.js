const WebSocket = require('ws');
const zlib = require('zlib');
const wss = new WebSocket.Server({ port: 8080 });

const connectedPods = new Map(); // Store connected pods

wss.on('connection', ws => {
    console.log('Client connected');

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);

            if (data.action === 'optimizeRoute') {
                const optimizedRoute = findShortestPath(data.start, data.end);
                const response = JSON.stringify({ route: optimizedRoute });
                zlib.deflate(response, (err, buffer) => {
                    if (!err) {
                        ws.send(buffer);
                    }
                });
            }

            // Register pod by ID
            if (data.action === 'registerPod' && data.pod_id) {
                connectedPods.set(data.pod_id, ws);
                console.log(`Pod ${data.pod_id} registered.`);
            }

            // Trigger pod movement after booking confirmation
            if (data.action === 'movePod' && data.pod_id) {
                const podSocket = connectedPods.get(data.pod_id);
                if (podSocket && podSocket.readyState === WebSocket.OPEN) {
                    podSocket.send(JSON.stringify({ command: 'start' }));
                    console.log(`Sent start command to Pod ${data.pod_id}`);
                }
            }

        } catch (error) {
            console.error('Error processing WebSocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        for (const [pod_id, socket] of connectedPods.entries()) {
            if (socket === ws) {
                connectedPods.delete(pod_id);
                console.log(`Pod ${pod_id} removed from registry.`);
                break;
            }
        }
    });
});

function findShortestPath(start, end) {
    const graph = {
        'BVRIT College': { 'Point A': 2, 'Point B': 4 },
        'Point A': { 'Point B': 1, 'Destination': 7 },
        'Point B': { 'Destination': 3 },
        'Destination': {}
    };

    const distances = {};
    const previous = {};
    const queue = new Set(Object.keys(graph));

    for (let node of queue) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    while (queue.size) {
        const currentNode = [...queue].reduce((minNode, node) =>
            distances[node] < distances[minNode] ? node : minNode
        );

        if (currentNode === end) break;

        queue.delete(currentNode);

        for (let neighbor in graph[currentNode]) {
            const alt = distances[currentNode] + graph[currentNode][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = currentNode;
            }
        }
    }

    const path = [];
    let currentNode = end;
    while (currentNode) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }

    return path;
}
