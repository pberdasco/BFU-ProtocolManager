-- Reemplazar con el ID del subproyecto que querés limpiar
-- DECLARE @subproyectoId INT = 55;
use `bfu-project-testdb`;
SET SQL_SAFE_UPDATES = 0;
SET @subproyectoId = 55;

-- 1. Borrar valores de la cadena completa
DELETE CCV
FROM cadenaCompletaValores CCV
JOIN cadenaCompletaFilas CCF ON CCV.cadenaCompletaFilaId = CCF.id
JOIN cadenaCustodia CC ON CCF.cadenaCustodiaId = CC.id
JOIN eventoMuestreo EM ON CC.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 2. Borrar filas de la cadena completa
DELETE CCF
FROM cadenaCompletaFilas CCF
JOIN cadenaCustodia CC ON CCF.cadenaCustodiaId = CC.id
JOIN eventoMuestreo EM ON CC.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 3. Borrar análisis requeridos
DELETE AR
FROM analisisRequeridos AR
JOIN cadenaCustodia CC ON AR.cadenaCustodiaId = CC.id
JOIN eventoMuestreo EM ON CC.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 4. Borrar resultados protocolo
DELETE RP 
FROM ResultadosProtocolo RP
JOIN muestrasProtocolo MP ON MP.Id = RP.muestraProtocoloId 
JOIN protocolos P ON MP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 5. Borrar muestras protocolo
DELETE MP
FROM muestrasProtocolo MP
JOIN protocolos P ON MP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 6. Borrar ítems del protocolo
DELETE IP
FROM itemsProtocolo IP
JOIN protocolos P ON IP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 7. Borrar protocolos
DELETE P
FROM protocolos P
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 8. Borrar muestras
DELETE M
FROM muestras M
JOIN cadenaCustodia CC ON M.cadenaCustodiaId = CC.id
JOIN eventoMuestreo EM ON CC.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 9. Borrar cadenas de custodia
DELETE CC
FROM cadenaCustodia CC
JOIN eventoMuestreo EM ON CC.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyectoId;

-- 10. Borrar eventos de muestreo
DELETE FROM eventoMuestreo
WHERE subproyectoId = @subproyectoId;
