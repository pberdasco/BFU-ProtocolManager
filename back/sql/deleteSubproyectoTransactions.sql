SET SQL_SAFE_UPDATES = 0;
SET @subpCodigo = '201894-085';

USE `bfu-project-testdb`;

SELECT id INTO @subproyecto FROM subproyectos WHERE codigo = @subpCodigo;
SELECT @subproyecto;

DELETE CCV FROM CadenaCompletaValores CCV
LEFT JOIN CadenaCompletaFilas CCF ON ccv.cadenaCompletaFilaId = CCF.id
LEFT JOIN CadenaCustodia CC ON CCF.CadenaCustodiaId = CC.id
WHERE CC.subproyectoID = @subproyecto;

DELETE CCF FROM CadenaCompletaFilas CCF
LEFT JOIN CadenaCustodia CC ON CCF.CadenaCustodiaId = CC.id
WHERE CC.subproyectoID = @subproyecto;

DELETE AR
FROM analisisRequeridos AR
JOIN cadenaCustodia CC ON AR.cadenaCustodiaId = CC.id
WHERE CC.subproyectoId = @subproyecto;

DELETE RP
FROM ResultadosProtocolo RP
JOIN MuestrasProtocolo MP ON RP.muestraProtocoloId = MP.id
JOIN protocolos P ON MP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyecto;

DELETE MP
FROM muestrasProtocolo MP
JOIN protocolos P ON MP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyecto;

DELETE IP
FROM itemsProtocolo IP
JOIN protocolos P ON IP.protocoloId = P.id
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyecto;

DELETE P
FROM protocolos P
JOIN eventoMuestreo EM ON P.eventoMuestreoId = EM.id
WHERE EM.subproyectoId = @subproyecto;

DELETE M FROM Muestras m
LEFT JOIN CadenaCustodia CC ON M.CadenaCustodiaId = CC.id
WHERE CC.subproyectoID = @subproyecto;

DELETE FROM CadenaCustodia CC
WHERE CC.subproyectoID = @subproyecto;

DELETE FROM EventoMuestreo E
WHERE E.subproyectoID = @subproyecto;

SET SQL_SAFE_UPDATES = 1;