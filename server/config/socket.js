import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        socket.on('join', (room, ack) => {
            socket.join(room);
            if (typeof ack === 'function') {
                ack({ ok: true, room });
            }
        });
    });

    return io;
};

export const getIO = () => io;