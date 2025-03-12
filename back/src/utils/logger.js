import winston from 'winston';
// TODO: Eventualmente agregar: import DailyRotateFile from 'winston-daily-rotate-file';

// Obtener las variables de entorno
process.loadEnvFile();
const errorsToConsole = process.env.ERRORS_TO_CONSOLE === 'true';
const infoToConsole = process.env.INFO_TO_CONSOLE === 'true';
const debugToConsole = process.env.DEBUG_TO_CONSOLE === 'true';
const loggerMinLevel = process.env.LOGGER_MIN_LEVEL;

// Formato común para todos los logs
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Funciones de filtro para los niveles
const levelFilter = (level) => {
  return winston.format((info) => {
    return info.level === level ? info : false;
  });
};

const levelsFilter = (levels) => {
  return winston.format((info) => {
    return levels.includes(info.level) ? info : false;
  });
};

// Configurar los transportes
const transports = [
  // Transporte para errores (error y warn) en errors.log
  new winston.transports.File({
    filename: 'logs/errors.log',
    level: 'warn',
    format: winston.format.combine(
      winston.format.timestamp(),
      logFormat
    )
  }),

  // Transporte para info en info.log
  new winston.transports.File({
    filename: 'logs/info.log',
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      logFormat
    )
  })

];

// Transporte para `warn` y `error` en consola si `ERRORS_TO_CONSOLE` es true
if (errorsToConsole) {
  transports.push(
    new winston.transports.Console({
      level: 'warn',
      format: winston.format.combine(
        levelsFilter(['error', 'warn'])(),
        winston.format.timestamp(),
        winston.format.colorize({ all: false }),
        logFormat
      )
    })
  );
}

// Transporte para `info` en consola si `INFO_TO_CONSOLE` es true
if (infoToConsole) {
  transports.push(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        levelFilter('info')(),
        winston.format.timestamp(),
        winston.format.colorize({ all: false }),
        logFormat
      )
    })
  );
}

// Transporte para `debug` y `verbose` en consola si `DEBUG_TO_CONSOLE` es true
if (debugToConsole) {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        levelsFilter(['debug', 'verbose'])(),
        winston.format.timestamp(),
        winston.format.colorize({ all: false }),
        logFormat
      )
    })
  );
}

// Crear el logger con los transportes configurados
const logger = winston.createLogger({
  level: loggerMinLevel,
  transports
});

export default logger;
