-- Borra todos los protocolos y sus asignaciones para un evento.
--    (deja intactos las cadenas + muestras + analisis)

SET SQL_SAFE_UPDATES = 0;
SET @subpCodigo = '201894-151';
SET @evento = 'Hist_2025-03-26';

USE `bfu-project-testdb`;

SELECT id INTO @subproyecto FROM subproyectos WHERE codigo = @subpCodigo;
SELECT @subproyecto;

SELECT id INTO @eventoId FROM eventoMuestreo WHERE nombre = @evento AND subproyectoId = @subproyecto;
SELECT @eventoId;

DELETE CCV FROM CadenaCompletaValores CCV
LEFT JOIN CadenaCompletaFilas CCF ON ccv.cadenaCompletaFilaId = CCF.id
LEFT JOIN CadenaCustodia CC ON CCF.CadenaCustodiaId = CC.id
WHERE CC.EventoMuestreoId = @eventoId;

DELETE CCF FROM CadenaCompletaFilas CCF
LEFT JOIN CadenaCustodia CC ON CCF.CadenaCustodiaId = CC.id
WHERE CC.EventoMuestreoId = @eventoId;

DELETE RP
FROM ResultadosProtocolo RP
JOIN MuestrasProtocolo MP ON RP.muestraProtocoloId = MP.id
JOIN protocolos P ON MP.protocoloId = P.id
WHERE P.EventoMuestreoId = @eventoId;

DELETE MP
FROM muestrasProtocolo MP
JOIN protocolos P ON MP.protocoloId = P.id
WHERE P.EventoMuestreoId = @eventoId;

DELETE IP
FROM itemsProtocolo IP
JOIN protocolos P ON IP.protocoloId = P.id
WHERE P.EventoMuestreoId = @eventoId;

DELETE P
FROM protocolos P
WHERE P.EventoMuestreoId = @eventoId;


SET SQL_SAFE_UPDATES = 1;