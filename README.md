# TurnosRed

Backend para centralizar la gestión de turnos de varias sedes de atención ambulatoria (clínica médica, pediatría, odontología y nutrición). Construido con Node.js, TypeScript, Express y Socket.IO.

## Requisitos previos

- Node.js 24 (LTS), gestionado con [NVM](https://github.com/nvm-sh/nvm)
- npm (incluido con Node.js)
- Git

## Instalación

\`\`\`bash
git clone <URL_DEL_REPOSITORIO>
cd turnos-red
nvm use
cp .env.example .env
npm install
\`\`\`

## Variables de entorno

| Variable          | Descripción                                   | Valor por defecto      |
| ----------------- | ---------------------------------------------- | ----------------------- |
| `PORT`            | Puerto en el que escucha el servidor HTTP      | `3000`                  |
| `DATA_FILE_PATH`  | Ruta del archivo JSON con los turnos           | `./data/turnos.json`    |

## Scripts disponibles

| Script           | Comando                       | Descripción                                              |
| ----------------- | ------------------------------ | ---------------------------------------------------------- |
| `npm run dev`     | `tsx watch src/server.ts`     | Levanta el servidor en modo desarrollo con recarga automática |
| `npm run build`   | `tsc`                          | Compila TypeScript de `src/` hacia `dist/`                |
| `npm start`       | `node dist/server.js`         | Ejecuta el servidor ya compilado (producción)              |
| `npm run lint`    | `eslint . --ext .ts`          | Analiza el código en busca de errores y malas prácticas    |
| `npm run format`  | `prettier --write .`          | Formatea el código según las reglas de Prettier            |

## Estructura de carpetas

\`\`\`
turnos-red/
├── data/               # Datos crudos y persistidos (turnos.json)
├── public/             # Cliente HTML de prueba para Socket.IO
└── src/
    ├── app.ts          # Configuración de Express (middlewares, rutas, errores)
    ├── server.ts       # Punto de entrada: crea el servidor HTTP y Socket.IO
    ├── config/         # Carga de variables de entorno
    ├── models/         # Interfaces de dominio (TurnoCrudo, Turno)
    ├── services/       # Normalización de datos y acceso/CRUD sobre turnos
    ├── controllers/     # Lógica de cada endpoint HTTP
    ├── routes/         # Definición de rutas Express
    ├── events/         # Bus de eventos internos (EventEmitter)
    ├── sockets/        # Integración de Socket.IO con el EventEmitter
    └── utils/          # Módulos auxiliares (comparación callbacks vs. promesas)
\`\`\`

## Endpoints

| Método   | Ruta            | Descripción                  |
| -------- | ---------------- | ----------------------------- |
| `GET`    | `/turnos`        | Lista todos los turnos        |
| `GET`    | `/turnos/:id`    | Obtiene un turno por id       |
| `POST`   | `/turnos`        | Crea un turno nuevo           |
| `PUT`    | `/turnos/:id`    | Actualiza un turno existente  |
| `DELETE` | `/turnos/:id`    | Elimina un turno              |

## Tiempo real

El servidor emite por Socket.IO los eventos `turno:nuevo`, `turno:actualizado` y `turno:eliminado` cada vez que se crea, actualiza o elimina un turno. Podés verlos en acción abriendo `public/socket-test.html` en el navegador mientras el servidor está corriendo.
