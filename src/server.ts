import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { inicializarTurnos } from './services/turnos.service.js';
import { inicializarMedicos } from './services/medicos.service.js';
import { configurarSocket } from './sockets/socket.js';

async function iniciarServidor(): Promise<void> {
  await inicializarMedicos();
  await inicializarTurnos();

  const servidorHttp = createServer(app);
  configurarSocket(servidorHttp);

  servidorHttp.listen(env.port, () => {
    console.log(`Servidor TurnosRed escuchando en http://localhost:${env.port}`);
  });
}

iniciarServidor().catch((error: unknown) => {
  console.error('No se pudo iniciar el servidor:', error);
  process.exit(1);
});
