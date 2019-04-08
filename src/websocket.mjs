import WebSocket from 'ws';

export const wss = new WebSocket.Server({ port: 4000 });
export const broadcast = data => {
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(data));
		}
	});
};