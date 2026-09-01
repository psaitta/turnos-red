import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { turnosEmitter } from '../events/turnosEmitter.js';

/**
 * Conecta el EventEmitter interno con Socket.IO: cada vez que el servicio
 * de turnos emite un evento interno, se retransmite en tiempo real a todos
 * los clientes conectados, sin necesidad de recargar la página ni hacer polling.
 */
export function configurarSocket(servidorHttp: HttpServer): SocketIOServer {
  const io = new SocketIOServer(servidorHttp, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado por Socket.IO: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  turnosEmitter.on('turno:creado', (turno) => {
    io.emit('turno:nuevo', turno);
  });

  turnosEmitter.on('turno:actualizado', (turno) => {
    io.emit('turno:actualizado', turno);
  });

  turnosEmitter.on('turno:eliminado', (turno) => {
    io.emit('turno:eliminado', turno);
  });

  return io;
}
