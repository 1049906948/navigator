const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 处理根路径请求，返回index.html
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server });

// 存储所有连接的客户端
const clients = new Set();

// WebSocket 连接处理
wss.on('connection', (ws) => {
    // 将新客户端添加到集合中
    clients.add(ws);
    console.log('新客户端连接');

    // 处理接收到的消息
    ws.on('message', (message) => {
        // 广播消息给其他所有客户端
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // 处理客户端断开连接
    ws.on('close', () => {
        clients.delete(ws);
        console.log('客户端断开连接');
    });
});

// 启动服务器
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`WebSocket 服务器运行在端口 ${PORT}`);
});