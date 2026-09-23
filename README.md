# TurnosRed

API REST para la gestión de **médicos**, **turnos** y (próximamente) **pacientes** de un centro de salud, construida con Node.js, TypeScript y Express 5, siguiendo principios de Clean Architecture (rutas → controllers → services → persistencia en JSON).

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura de directorios](#estructura-de-directorios)
- [Arquitectura y manejo de errores](#arquitectura-y-manejo-de-errores)
- [Documentación de endpoints](#documentación-de-endpoints)
- [Módulo Pacientes (propuesta)](#módulo-pacientes-propuesta)
- [Pruebas](#pruebas)
- [Uso de Inteligencia Artificial](#uso-de-inteligencia-artificial)

## Tecnologías

- Node.js (LTS)
- TypeScript
- Express 5
- Zod (validación de esquemas)
- tsx (ejecución en desarrollo con recarga automática)
- Postman / Newman (pruebas de integración y E2E)

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Postman para ejecutar la colección de pruebas
- Puerto `3000` libre en el entorno local

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/pablosaitta/turnos-red.git
cd turnos-red

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar el servidor en modo desarrollo (recarga automática con tsx)
npm run dev

# 5. Compilar para producción
npm run build

# 6. Ejecutar la versión compilada
npm start

# Utilidades adicionales
npm run lint     # ESLint sobre todo el proyecto
npm run format   # Prettier, reescribe archivos
```

El servidor queda disponible en `http://localhost:3000`.

## Variables de entorno

Definidas y cargadas mediante `dotenv` en `src/config/env.ts`. Si una variable no está presente en `.env`, se usa su valor por defecto; `PORT` es la única sin la cual el servidor no arranca si además falta el valor por defecto.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor | `3000` |
| `MEDICOS_FILE_PATH` | Ruta del archivo JSON con los médicos | `./data/medicos.json` |
| `DATA_FILE_PATH` | Ruta del archivo JSON con los turnos | `./data/turnos.json` |

> Nota de seguridad (Módulo 4): el archivo `.env` real **nunca** se sube al repositorio — está excluido en `.gitignore`. Solo se versiona `.env.example` con los nombres de variable sin valores sensibles.

## Estructura de directorios

```
turnos-red/
├── src/
│   ├── controllers/         # medicos.controller.ts, turnos.controller.ts, general.controller.ts
│   ├── routes/               # medicos.routes.ts, turnos.routes.ts
│   ├── services/             # medicos.service.ts, turnos.service.ts, normalizarTurnos.ts
│   ├── schemas/               # medico.schema.ts, turno.schema.ts (validación Zod)
│   ├── middlewares/           # errorHandler.ts, validate.ts
│   ├── models/                 # medico.model.ts, turno.model.ts
│   ├── events/                  # turnosEmitter.ts
│   ├── config/                  # env.ts
│   ├── data/                     # medicos.json, turnos.json
│   ├── app.ts
│   └── server.ts
├── pacientes-turnos.md        # Propuesta del módulo Pacientes (mockup)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Arquitectura y manejo de errores

Cada controller (`medicos.controller.ts`, `turnos.controller.ts`, `general.controller.ts`) es asincrónico, declara una variable `status` dinámica según el resultado, valida previamente los datos y envuelve toda su lógica en un bloque `try-catch`, respondiendo siempre con `return res.status(status).json(...)`.

La validación de los datos de entrada (`body`) se resuelve mediante un middleware genérico `validate(schema)` (`src/middlewares/validate.ts`) que aplica un schema de **Zod** antes de llegar al controller. Si falla, delega el error al middleware centralizado de errores (`src/middlewares/errorHandler.ts`) mediante `next(error)`.

Toda respuesta de error de la API respeta el mismo formato estándar:

```json
{
  "status": 404,
  "message": "No se encontró el médico con id 9999",
  "code": "MEDICO_NOT_FOUND",
  "details": []
}
```

- `status`: código HTTP.
- `message`: mensaje legible para el consumidor de la API.
- `code`: identificador estable de la condición de error, para que el cliente tome decisiones sin depender del texto exacto de `message`.
- `details`: información adicional controlada (por ejemplo, el detalle campo por campo de una validación fallida).

## Documentación de endpoints

### Médicos

#### `GET /medicos`
Lista médicos, con filtros opcionales por query params.

**Query params:**
| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `especialidad` | string | `?especialidad=Nutrición` | Filtra por especialidad |
| `disponible` | boolean (`"true"`/`"false"`) | `?disponible=true` | Filtra por disponibilidad |

**Respuesta `200`:** array de médicos.

#### `GET /medicos/:id`
Obtiene un médico por id.

**Respuesta `200`:**
```json
{ "id": 9, "nombre": "Dra. Paula Ríos", "especialidad": "Nutrición", "matricula": "MP-13501", "disponible": true }
```
**Respuesta `400`** (id no numérico): `code: "INVALID_ID"`.
**Respuesta `404`** (id inexistente): `code: "MEDICO_NOT_FOUND"`.

#### `POST /medicos`
Crea un médico. Body validado contra `medicoSchema`.

**Body:**
```json
{ "nombre": "Dra. Paula Ríos", "especialidad": "Nutrición", "matricula": "MP-13501", "disponible": true }
```
Especialidades válidas: `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`.

**Respuesta `201`:** el médico creado, con `id` asignado.
**Respuesta `400`** (`code: "VALIDATION_ERROR"`): detalle campo por campo en `details`.

#### `PUT /medicos/:id`
Actualiza parcialmente un médico. Body validado contra `medicoUpdateSchema` (todos los campos opcionales).

**Respuesta `200`:** médico actualizado. **Respuesta `404`**: `code: "MEDICO_NOT_FOUND"`.

#### `DELETE /medicos/:id`
Elimina un médico. **Respuesta `204`** (sin cuerpo). **Respuesta `404`**: `code: "MEDICO_NOT_FOUND"`.

### Turnos

#### `GET /turnos`
Lista turnos, con filtros opcionales.

**Query params:** `especialidad`, `fecha` (`AAAA-MM-DD`), `medicoId` (number).

#### `GET /turnos/:id`
Obtiene un turno por id. **Respuesta `404`**: `code: "TURNO_NOT_FOUND"`.

#### `POST /turnos`
Crea un turno. Body validado contra `turnoSchema`.

**Body:**
```json
{
  "paciente": "Juan Pérez",
  "documento": "12345678",
  "especialidad": "Nutrición",
  "fecha": "2026-10-01",
  "hora": "10:00",
  "confirmado": false,
  "medicoId": 2
}
```

**Respuesta `201`:** turno creado. **Respuesta `400`**: `code: "VALIDATION_ERROR"`. **Respuesta `404`** (medicoId inexistente): `code: "MEDICO_NOT_FOUND"`.

#### `PUT /turnos/:id`
Actualiza parcialmente un turno (`turnoUpdateSchema`). Si se envía `medicoId`, se revalida su existencia.

#### `DELETE /turnos/:id`
Elimina un turno. **Respuesta `204`**. **Respuesta `404`**: `code: "TURNO_NOT_FOUND"`.

### General

#### `GET /`
Endpoint de bienvenida. **Respuesta `200`:**
```json
{ "status": 200, "message": "Bienvenido a la API TurnosRed", "code": "OK", "details": [] }
```

#### Cualquier ruta no contemplada
**Respuesta `404`:** `code: "ROUTE_NOT_FOUND"`, con el método y la ruta solicitada en `message`.

## Módulo Pacientes (propuesta)

La entidad Pacientes todavía no está implementada. Su diseño conceptual, modelado de datos y la definición de los endpoints `POST /pacientes` y `GET /pacientes/:id` están documentados en [`pacientes-turnos.md`](./pacientes-turnos.md).

## Pruebas

La validación funcional y de integración se realiza mediante la colección de Postman `TurnosRed` (entorno `TurnosRed - Local`, con la variable `baseUrl`), que cubre los casos exitosos y los principales escenarios de error (datos inválidos, recursos inexistentes, rutas no encontradas).

> Nota (Módulo 4): a futuro, estos mismos escenarios podrían automatizarse con **Jest + Supertest** como pruebas de integración ejecutables desde `npm test`, complementando las pruebas E2E manuales en Postman.

## Uso de Inteligencia Artificial

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Generación de la documentación de endpoints del README | Claude | "Comparto mis archivos de rutas (`medicos.routes.ts`, `turnos.routes.ts`) y controllers (`.ts`); generá la documentación Markdown de cada endpoint con método, path, params, body y respuestas." | Bloques Markdown con la estructura de secciones por entidad, ejemplos de body/response en JSON. | Se ajustaron los ejemplos para que coincidan exactamente con los schemas Zod reales (`medicoSchema`, `turnoSchema`) y los códigos de error reales (`MEDICO_NOT_FOUND`, `TURNO_NOT_FOUND`, `VALIDATION_ERROR`). |
| Diseño conceptual del módulo Pacientes | Claude | "Proponeme el modelado de datos mínimo para una entidad Paciente en un sistema de turnos médicos, y dos endpoints RESTful siguiendo Clean Architecture." | Interfaz `PacienteNuevo`/`Paciente` en TypeScript y definición de `POST /pacientes` y `GET /pacientes/:id`. | Se alinearon los nombres de campo con la convención `camelCase` ya usada en el proyecto y se agregó la nota de seguridad sobre datos personales. |

---
*Documento actualizado para reflejar el estado del proyecto en la Actividad 4.*