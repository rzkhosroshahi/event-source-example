import server from './lib/server.js';
import staticServe from './lib/static.js';

const app = server();

const messages = {
    chats: [],
};

const clients = [];

app.use(staticServe);

app.use((req, res) => {
    if (req.url === '/message-event') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        clients.push(res);

        req.on('close', () => {
            clients.splice(clients.indexOf(res), 1);
        });

        return true;
    }
});

app.post('/message', (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        const data = JSON.parse(body);
        messages.chats.push({ ...data });

        clients.forEach((client) => {
            client.write(`event: chat\ndata: ${JSON.stringify(messages.chats)}\n\n`);
            client.end();
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'Message received' }));
    });
});

app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});
