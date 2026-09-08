import 'dotenv/config';

function obtenerVariable(nombre: string, valorPorDefecto?: string): string {
  const valor = process.env[nombre] ?? valorPorDefecto;
  if (valor === undefined) {
    throw new Error(`Falta configurar la variable de entorno ${nombre}`);
  }
  return valor;
}

export const env = {
  port: Number(obtenerVariable('PORT', '3000')),
  dataFilePath: obtenerVariable('DATA_FILE_PATH', './data/turnos.json'),
  medicosFilePath: obtenerVariable('MEDICOS_FILE_PATH', './data/medicos.json'),
};
