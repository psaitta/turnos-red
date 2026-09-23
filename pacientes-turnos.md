# Módulo Pacientes y Turnos — Propuesta conceptual (Mockup RESTful)

Este documento define la propuesta técnica para incorporar la gestión de **Pacientes** a TurnosRed y su relación con la entidad **Turno** ya existente, siguiendo los principios de Clean Architecture ya aplicados en el proyecto (separación en `routes/`, `controllers/`, `services/`, `schemas/`).

## 1. Modelado conceptual de datos

### 1.1 Paciente

Un paciente es la persona que solicita un turno médico. Los datos mínimos indispensables para su registro son:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `dni` | string | Sí | Documento de identidad, único por paciente |
| `nombre` | string | Sí | Nombre del paciente |
| `apellido` | string | Sí | Apellido del paciente |
| `fechaNacimiento` | string (`AAAA-MM-DD`) | Sí | Fecha de nacimiento |
| `telefono` | string | Sí | Teléfono de contacto |
| `email` | string | No | Correo electrónico de contacto |

```typescript
export interface PacienteNuevo {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
  email?: string;
}

export interface Paciente extends PacienteNuevo {
  id: number;
}
```

### 1.2 Turno médico y su relación con Paciente

La entidad `Turno`, ya implementada en el proyecto, hoy almacena los datos del paciente como texto libre (`paciente`, `documento`). La propuesta a futuro es evolucionar el modelo para referenciar a un paciente registrado mediante `pacienteId`, sin romper la compatibilidad con los turnos existentes:

```typescript
export interface TurnoNuevo {
  pacienteId: number;       // referencia al paciente registrado (propuesto)
  medicoId: number;
  especialidad: string;
  fecha: string;             // formato AAAA-MM-DD
  hora: string;               // formato HH:MM
  confirmado: boolean;
  observaciones?: string;
}
```

Esta evolución permitiría, por ejemplo, listar todos los turnos de un paciente por su `pacienteId` en vez de buscar coincidencias de texto en `documento`.

## 2. Nuevos endpoints RESTful — Módulo Pacientes

Siguiendo la misma convención ya usada en `medicos` y `turnos` (validación por schema con Zod a nivel de ruta, controller asincrónico con `try-catch` y `status` dinámico, service con persistencia en JSON), se definen los siguientes dos endpoints nuevos:

### 2.1 `POST /pacientes` — Registrar un nuevo paciente

**Body esperado:**
```json
{
  "dni": "30123456",
  "nombre": "Ana",
  "apellido": "Gómez",
  "fechaNacimiento": "1990-05-12",
  "telefono": "+54 9 341 555-1234",
  "email": "ana.gomez@example.com"
}
```

**Respuesta exitosa (`201 Created`):**
```json
{
  "id": 1,
  "dni": "30123456",
  "nombre": "Ana",
  "apellido": "Gómez",
  "fechaNacimiento": "1990-05-12",
  "telefono": "+54 9 341 555-1234",
  "email": "ana.gomez@example.com"
}
```

**Respuesta de error — validación (`400 Bad Request`):**
```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "campo": "dni", "mensaje": "El dni es obligatorio" }
  ]
}
```

### 2.2 `GET /pacientes/:id` — Obtener un paciente por id

**Parámetro de ruta:** `id` (number)

**Respuesta exitosa (`200 OK`):**
```json
{
  "id": 1,
  "dni": "30123456",
  "nombre": "Ana",
  "apellido": "Gómez",
  "fechaNacimiento": "1990-05-12",
  "telefono": "+54 9 341 555-1234",
  "email": "ana.gomez@example.com"
}
```

**Respuesta de error — id inexistente (`404 Not Found`):**
```json
{
  "status": 404,
  "message": "No se encontró el paciente con id 9999",
  "code": "PACIENTE_NOT_FOUND",
  "details": []
}
```

## 3. Consideraciones de arquitectura

Ambos endpoints seguirían la misma disposición de capas ya vigente en el proyecto:

```
routes/pacientes.routes.ts   → declara los endpoints y aplica validate(pacienteSchema)
controllers/pacientes.controller.ts → async, status dinámico, try-catch, return
services/pacientes.service.ts       → lógica de negocio y persistencia en src/data/pacientes.json
schemas/pacientes.schema.ts         → validación Zod (pacienteSchema, pacienteUpdateSchema)
```

## 4. Nota sobre datos sensibles (Módulo 4 — Seguridad)

Los datos de un paciente (DNI, fecha de nacimiento, contacto) son información personal. Aunque esta actividad no implementa autenticación, la propuesta deja registrado que, en una futura iteración, el acceso a `GET /pacientes/:id` debería requerir autenticación (por ejemplo JWT) y una regla de autorización que valide que quien consulta tiene permiso para ver ese paciente — no alcanza con que el dato no se muestre en el frontend, según señala el Módulo 4 sobre proteger las acciones sensibles también en el backend.