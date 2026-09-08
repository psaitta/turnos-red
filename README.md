# TurnosRed

API REST para la gestión de **médicos** y **turnos** de un centro de salud. Permite dar de alta médicos, consultar su disponibilidad, y crear, consultar y eliminar turnos asociados a ellos.

## Tabla de contenidos

- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura de directorios](#estructura-de-directorios)
- [Documentación de endpoints](#documentación-de-endpoints)
- [Casos de prueba (Postman)](#casos-de-prueba-postman)
- [Uso de Inteligencia Artificial](#uso-de-inteligencia-artificial)

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Postman (o Newman) para ejecutar la colección de pruebas
- Puerto `3000` libre en el entorno local

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/psaitta/turnosred.git
cd turnosred

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Levantar el servidor en modo desarrollo
npm run dev

# 5. (Opcional) Ejecutar en modo producción
npm run build
npm start
```

El servidor queda disponible en `http://localhost:3000`.

Para correr las pruebas de la colección de Postman vía línea de comandos:

```bash
npx newman run TurnosRed.postman_collection.json -e TurnosRed-Local.postman_environment.json
```

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto en el que escucha el servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | `development` |
| `DB_PATH` | Ruta del archivo de base de datos (SQLite) | `./data/turnosred.db` |
| `LOG_LEVEL` | Nivel de logging (`error`, `warn`, `info`, `debug`) | `info` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |

## Estructura de directorios

```
turnosred/
├── src/
│   ├── controllers/       # Lógica de manejo de requests (medicos, turnos)
│   ├── routes/            # Definición de rutas Express
│   ├── models/            # Esquemas y validaciones (Zod)
│   ├── services/          # Lógica de negocio
│   ├── middlewares/        # Manejo de errores, validaciones
│   ├── db/                # Conexión y migraciones de base de datos
│   └── app.js              # Configuración de la app Express
├── tests/
│   └── postman/            # Colección y entorno de Postman
├── data/                    # Base de datos local (SQLite)
├── .env.example
├── package.json
└── README.md
```

| Directorio | Contenido |
|---|---|
| `src/controllers` | Funciones que reciben la request y arman la respuesta |
| `src/routes` | Definición de endpoints y métodos HTTP |
| `src/models` | Esquemas de validación de médicos y turnos |
| `src/services` | Reglas de negocio (ej. validar disponibilidad de un médico) |
| `src/middlewares` | Manejo centralizado de errores y validaciones |
| `src/db` | Configuración de la conexión y migraciones |
| `tests/postman` | Colección `TurnosRed.postman_collection.json` y entorno `TurnosRed-Local` |

## Documentación de endpoints

### Médicos

#### `POST /medicos`
Crea un nuevo médico.

**Body:**
```json
{
  "nombre": "Dra. Paula Ríos",
  "especialidad": "Nutrición",
  "matricula": "MP-13501"
}
```

**Respuesta `201`:**
```json
{
  "id": 12,
  "nombre": "Dra. Paula Ríos",
  "especialidad": "Nutrición",
  "matricula": "MP-13501",
  "disponible": true
}
```

#### `GET /medicos/:id`
Obtiene un médico por id.

```
GET /medicos/9
```

**Respuesta `200`:**
```json
{
  "id": 9,
  "nombre": "Dra. Paula Ríos",
  "especialidad": "Nutrición",
  "matricula": "MP-13501",
  "disponible": true
}
```

**Respuesta `404`** (id inexistente, ej. `/medicos/9999`):
```json
{
  "error": "Médico no encontrado"
}
```

### Turnos

#### `POST /turnos`
Crea un turno asociado a un médico existente.

**Body:**
```json
{
  "medicoId": 12,
  "paciente": "Juan Pérez",
  "fecha": "2026-09-15",
  "hora": "10:30"
}
```

**Respuesta `201`:** el turno queda vinculado al médico correcto.

**Respuesta `404`** (si `medicoId` no existe):
```json
{
  "error": "Médico no encontrado"
}
```

#### `GET /turnos`
Lista turnos. Admite filtros combinables por **query params**:

| Parámetro | Tipo | Ejemplo | Descripción |
|---|---|---|---|
| `especialidad` | string | `?especialidad=Clínica médica` | Filtra por especialidad del médico |
| `medicoId` | number | `?medicoId=2` | Filtra por médico |
| `fecha` | string (`YYYY-MM-DD`) | `?fecha=2026-09-15` | Filtra por fecha del turno |

**Ejemplo combinado:**
```
GET /turnos?especialidad=Clínica médica&medicoId=2
```
Devuelve `200` con todos los turnos de la especialidad indicada, correspondientes al `medicoId` dado.

#### `DELETE /turnos/:id`
Elimina un turno existente.

```
DELETE /turnos/110
```

**Respuesta `204`:** sin cuerpo.

## Casos de prueba (Postman)

Colección `TurnosRed` — entorno `TurnosRed - Local`. Ejecución completa vía Runner: **17/17 tests aprobados, 0 fallidos, 0 omitidos** (1 s 156 ms).

| # | Método | Endpoint | Caso | Resultado esperado |
|---|--------|----------|------|---------------------|
| 1 | POST | `/medicos` | Alta de un nuevo médico | `201` — la respuesta tiene la forma de un médico y su `id` se guarda para las siguientes solicitudes |
| 2 | GET | `/medicos/:id` | Consulta de un médico existente | `200` — devuelve el médico esperado |
| 3 | GET | `/medicos/9999` | Consulta de un médico inexistente | `404` — código de error correcto |
| 4 | POST | `/medicos` | Alta con especialidad inválida | `400` — respuesta con el formato estándar de error |
| 5 | POST | `/turnos` | Alta de un turno | `201` — el turno queda vinculado al médico correcto |
| 6 | GET | `/turnos?especialidad=...&medicoId=...` | Filtro combinado por especialidad y médico | `200` — todos los resultados coinciden con el filtro |
| 7 | POST | `/turnos` | Alta de un turno con médico inexistente | `404` — código de error correcto |
| 8 | DELETE | `/turnos/:id` | Baja de un turno existente | `204` — la respuesta no tiene cuerpo |

**Intervención manual:** durante la ejecución inicial, el caso *POST /turnos — médico inexistente* devolvía intermitentemente `500` en lugar de `404` porque el mock server reutilizaba una respuesta guardada de una corrida anterior. Se corrigió manualmente el ejemplo de respuesta del mock (código `404` y cuerpo `{ "error": "Médico no encontrado" }`) y se volvió a validar el caso de forma individual antes de correr la colección completa.

## Uso de Inteligencia Artificial

Se utilizaron asistentes de IA como apoyo en distintas tareas de desarrollo y testing. Todas las respuestas generadas fueron revisadas y ajustadas manualmente antes de integrarse al proyecto.

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Schema de validación de médico | ChatGPT | "Necesito un schema Zod para validar un médico con nombre (string), especialidad (enum: Clínica médica, Nutrición, Pediatría), matrícula (string con formato MP-#####) y disponible (boolean, opcional)." | ```const MedicoSchema = z.object({ nombre: z.string(), especialidad: z.enum(["clinica_medica","nutricion","pediatria"]), matricula: z.string().regex(/^MP-\d{5}$/), disponible: z.boolean().optional() })``` | Se pasaron los valores del enum a `PascalCase` con tildes ("Clínica médica", "Nutrición", "Pediatría") para que coincidan con los datos reales, y se renombraron los campos a `camelCase` consistentes con el resto del modelo. |
| Test de error 404 en Postman | Claude | "Necesito un test en Postman (pm.test) que valide que la respuesta de POST /turnos ante un medicoId inexistente devuelva status 404 y un cuerpo con la propiedad `error`. ¿Cómo lo escribo?" | ```pm.test("Status code es 404", () => { pm.response.to.have.status(404); }); pm.test("Código de error correcto", () => { const body = pm.response.json(); pm.expect(body).to.have.property("error"); });``` | Ninguno: el código se usó tal cual y se replicó en los demás casos de error de ambas colecciones. |
| Filtro combinado de turnos | Gemini | "Dame la lógica en Express para filtrar un array de turnos por especialidad del médico asociado y por medicoId, ambos query params opcionales." | ```const filtered = turnos.filter(t => { const medico = medicos.find(m => m.id === t.medicoId); if (especialidad && medico.especialidad !== especialidad) return false; if (medicoId && t.medicoId !== Number(medicoId)) return false; return true; });``` | Se agregó el manejo de `especialidad` con espacios/acentos (`decodeURIComponent`) y la validación de que `medico` exista antes de acceder a `medico.especialidad`, para evitar un error si el turno quedó huérfano. |
| Redacción de la documentación de endpoints | ChatGPT | "Ayudame a redactar en Markdown la documentación de los endpoints de médicos y turnos, incluyendo ejemplos de body y de query params." | Bloques de Markdown con la estructura de secciones por endpoint, ejemplos de `body` en JSON y tabla de query params. | Se corrigieron los ejemplos de body y respuesta para que coincidan exactamente con los datos reales devueltos por el mock server (nombre del médico, matrícula, ids), y se agregó el ejemplo de filtro combinado real (`especialidad` + `medicoId`). |

---