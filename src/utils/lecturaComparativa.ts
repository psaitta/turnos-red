import fs from 'node:fs';

/**
 * Ejemplo comparativo: lectura de archivos con callbacks vs. promesas.
 *
 * --- Con callbacks (estilo clásico, módulo node:fs) ---
 * - El manejo de errores obliga a revisar el primer parámetro en cada callback.
 * - Encadenar varias lecturas provoca "callback hell": funciones anidadas
 *   difíciles de leer y de mantener.
 * - No se puede usar "await", por lo que el orden de ejecución queda implícito
 *   dentro de la función de callback.
 */
export function leerConCallback(ruta: string): void {
  fs.readFile(ruta, 'utf-8', (error, datos) => {
    if (error) {
      console.error('Error al leer el archivo con callback:', error.message);
      return;
    }
    console.log('Archivo leído con callback. Longitud del contenido:', datos.length);
  });
}

/**
 * --- Con promesas + async/await (estilo usado en este proyecto, node:fs/promises) ---
 * - El bloque try...catch centraliza el manejo de errores en un solo lugar.
 * - El código se lee en forma secuencial, de arriba hacia abajo, igual que
 *   código síncrono, aunque la operación es asíncrona.
 * - Es mucho más simple de combinar con otras operaciones asíncronas
 *   (por ejemplo con Promise.all para leer varios archivos en paralelo).
 *
 * Por estas razones, el servicio de turnos (src/services/turnos.service.ts)
 * utiliza fs/promises en lugar de callbacks para leer data/turnos.json.
 */
