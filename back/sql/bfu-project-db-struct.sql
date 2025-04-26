CREATE DATABASE  IF NOT EXISTS `bfu-project-db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bfu-project-db`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bfu-project-db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AnalisisRequeridos`
--

DROP TABLE IF EXISTS `AnalisisRequeridos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AnalisisRequeridos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CadenaCustodiaId` int NOT NULL,
  `Tipo` int NOT NULL,
  `GrupoId` int DEFAULT NULL,
  `MetodoId` int NOT NULL,
  `CompuestoId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `AnReq_Grupo_idx` (`GrupoId`),
  KEY `AnReq_Metodo_idx` (`MetodoId`),
  KEY `AnReq_Compuesto_idx` (`CompuestoId`),
  KEY `AnReq_Cadena_idx` (`CadenaCustodiaId`),
  CONSTRAINT `AnReq_Cadena` FOREIGN KEY (`CadenaCustodiaId`) REFERENCES `CadenaCustodia` (`Id`),
  CONSTRAINT `AnReq_Compuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `AnReq_Grupo` FOREIGN KEY (`GrupoId`) REFERENCES `GrupoCompuestos` (`Id`),
  CONSTRAINT `AnReq_Metodo` FOREIGN KEY (`MetodoId`) REFERENCES `Metodos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AutAplicacion`
--

DROP TABLE IF EXISTS `AutAplicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AutAplicacion` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(60) NOT NULL,
  `SitioWeb1` varchar(60) DEFAULT NULL,
  `SitioWeb2` varchar(60) DEFAULT NULL,
  `ProvinciaId` int NOT NULL,
  `MatrizId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `AutAplicacion_Provincias_idx` (`ProvinciaId`),
  KEY `AutAplicacion_Matriz_idx` (`MatrizId`),
  CONSTRAINT `AutAplicacion_Matriz` FOREIGN KEY (`MatrizId`) REFERENCES `Matriz` (`Id`),
  CONSTRAINT `AutAplicacion_Provincias` FOREIGN KEY (`ProvinciaId`) REFERENCES `Provincias` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1002 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CadenaCompletaFilas`
--

DROP TABLE IF EXISTS `CadenaCompletaFilas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CadenaCompletaFilas` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `cadenaCustodiaId` int NOT NULL,
  `compuestoId` int NOT NULL,
  `metodoId` int NOT NULL,
  `umId` int NOT NULL,
  `estado` int NOT NULL,
  `protocoloItemId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UNIQUE` (`cadenaCustodiaId`,`compuestoId`,`metodoId`),
  KEY `CadenaCompleta_Cadena_idx` (`cadenaCustodiaId`),
  KEY `CadenaCompleta_Compuesto_idx` (`compuestoId`),
  KEY `CadenaCompleta_Metodo_idx` (`metodoId`),
  KEY `CadenaCompleta_UM_idx` (`umId`),
  KEY `CadenaCompleta_ProtocoloItem_idx` (`protocoloItemId`),
  CONSTRAINT `CadenaCompleta_Cadena` FOREIGN KEY (`cadenaCustodiaId`) REFERENCES `CadenaCustodia` (`Id`),
  CONSTRAINT `CadenaCompleta_Compuesto` FOREIGN KEY (`compuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `CadenaCompleta_Metodo` FOREIGN KEY (`metodoId`) REFERENCES `Metodos` (`Id`),
  CONSTRAINT `CadenaCompleta_ProtocoloItem` FOREIGN KEY (`protocoloItemId`) REFERENCES `ItemsProtocolo` (`Id`),
  CONSTRAINT `CadenaCompleta_UM` FOREIGN KEY (`umId`) REFERENCES `UM` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=258 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CadenaCompletaValores`
--

DROP TABLE IF EXISTS `CadenaCompletaValores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CadenaCompletaValores` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `cadenaCompletaFilaId` int NOT NULL,
  `muestraId` int NOT NULL,
  `valor` decimal(8,3) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `CadenaCompletaValores_Fila_idx` (`cadenaCompletaFilaId`),
  KEY `CadenaCompletaValores_Muestra_idx` (`muestraId`),
  CONSTRAINT `CadenaCompletaValores_Fila` FOREIGN KEY (`cadenaCompletaFilaId`) REFERENCES `CadenaCompletaFilas` (`Id`),
  CONSTRAINT `CadenaCompletaValores_Muestra` FOREIGN KEY (`muestraId`) REFERENCES `Muestras` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=626 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CadenaCustodia`
--

DROP TABLE IF EXISTS `CadenaCustodia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CadenaCustodia` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  `LaboratorioId` int NOT NULL,
  `Fecha` date DEFAULT NULL,
  `EventoMuestreoId` int NOT NULL,
  `SubproyectoId` int NOT NULL,
  `MatrizCodigo` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `Cadena-Evento_idx` (`EventoMuestreoId`),
  KEY `Cadena-Matriz_idx` (`MatrizCodigo`),
  KEY `Cadena-Subproyecto_idx` (`SubproyectoId`),
  CONSTRAINT `Cadena-Evento` FOREIGN KEY (`EventoMuestreoId`) REFERENCES `EventoMuestreo` (`Id`),
  CONSTRAINT `Cadena-Matriz` FOREIGN KEY (`MatrizCodigo`) REFERENCES `Matriz` (`Codigo`),
  CONSTRAINT `Cadena-Subproyecto` FOREIGN KEY (`SubproyectoId`) REFERENCES `SubProyectos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Clientes`
--

DROP TABLE IF EXISTS `Clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clientes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(12) NOT NULL,
  `Nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Codigo_UNIQUE` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Compuestos`
--

DROP TABLE IF EXISTS `Compuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Compuestos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(10) NOT NULL,
  `Nombre` varchar(45) NOT NULL,
  `AgrupaEn` int DEFAULT NULL,
  `ExponeId` int NOT NULL DEFAULT '0',
  `MatrizCodigo` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `Compuesto_Tipo_idx` (`MatrizCodigo`),
  CONSTRAINT `Compuesto_Matriz` FOREIGN KEY (`MatrizCodigo`) REFERENCES `Matriz` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=521 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EventoMuestreo`
--

DROP TABLE IF EXISTS `EventoMuestreo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EventoMuestreo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Fecha` date NOT NULL,
  `SubProyectoId` int NOT NULL,
  `Nombre` varchar(45) NOT NULL,
  `CadenasCustodiaPDFLink` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `Evento-SubProyecto_idx` (`SubProyectoId`),
  CONSTRAINT `Evento-SubProyecto` FOREIGN KEY (`SubProyectoId`) REFERENCES `SubProyectos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GrupoCompuestos`
--

DROP TABLE IF EXISTS `GrupoCompuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `GrupoCompuestos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  `MetodoId` int NOT NULL,
  `MatrizCodigo` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Nombre_UNIQUE` (`Nombre`,`MatrizCodigo`),
  KEY `GrupoCompuesto_Matriz_idx` (`MatrizCodigo`),
  KEY `Grupo_Metodo_idx` (`MetodoId`),
  CONSTRAINT `Grupo_Metodo` FOREIGN KEY (`MetodoId`) REFERENCES `Metodos` (`Id`),
  CONSTRAINT `GrupoCompuesto_Matriz` FOREIGN KEY (`MatrizCodigo`) REFERENCES `Matriz` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ItemsProtocolo`
--

DROP TABLE IF EXISTS `ItemsProtocolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ItemsProtocolo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProtocoloId` int NOT NULL,
  `CompuestoLab` varchar(45) DEFAULT NULL,
  `CompuestoId` int DEFAULT NULL,
  `MetodoLab` varchar(45) DEFAULT NULL,
  `MetodoId` int DEFAULT NULL,
  `UmLab` varchar(10) DEFAULT NULL,
  `UmId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ItemProt-Prot_idx` (`ProtocoloId`),
  KEY `ItemProt-Compuesto_idx` (`CompuestoId`),
  KEY `ItemProt-Metodo_idx` (`MetodoId`),
  KEY `ItemProt-Um_idx` (`UmId`),
  CONSTRAINT `ItemProt-Compuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `ItemProt-Metodo` FOREIGN KEY (`MetodoId`) REFERENCES `Metodos` (`Id`),
  CONSTRAINT `ItemProt-Prot` FOREIGN KEY (`ProtocoloId`) REFERENCES `Protocolos` (`Id`),
  CONSTRAINT `ItemProt-Um` FOREIGN KEY (`UmId`) REFERENCES `UM` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Laboratorios`
--

DROP TABLE IF EXISTS `Laboratorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Laboratorios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  `Domicilio` varchar(60) DEFAULT NULL,
  `Formato` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LQs`
--

DROP TABLE IF EXISTS `LQs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `LQs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `LaboratorioId` int NOT NULL,
  `CompuestoId` int NOT NULL,
  `MetodoId` int DEFAULT NULL,
  `UMId` int NOT NULL,
  `ValorLQ` decimal(8,5) NOT NULL,
  `MatrizId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  UNIQUE KEY `Lab-Comp-Metodo` (`LaboratorioId`,`CompuestoId`,`MetodoId`),
  KEY `LQs-Laboratorio_idx` (`LaboratorioId`),
  KEY `LQs-Cmpuesto_idx` (`CompuestoId`) /*!80000 INVISIBLE */,
  KEY `LQs-Metodo_idx` (`MetodoId`),
  KEY `LQs-UM_idx` (`UMId`),
  CONSTRAINT `LQs-Cmpuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=491 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Matriz`
--

DROP TABLE IF EXISTS `Matriz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Matriz` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Codigo` int NOT NULL,
  `Nombre` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Codigo_UNIQUE` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Metodos`
--

DROP TABLE IF EXISTS `Metodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Metodos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mkCompuestos`
--

DROP TABLE IF EXISTS `mkCompuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mkCompuestos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `subproyectoId` int NOT NULL,
  `compuestoId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `subproyecto-compuesto` (`subproyectoId`,`compuestoId`),
  KEY `mkCompuestos-subproyecto_idx` (`subproyectoId`),
  KEY `mkCompuestos-compuestos_idx` (`compuestoId`),
  CONSTRAINT `mkCompuestos-compuestos` FOREIGN KEY (`compuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `mkCompuestos-subproyecto` FOREIGN KEY (`subproyectoId`) REFERENCES `SubProyectos` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mkPozos`
--

DROP TABLE IF EXISTS `mkPozos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mkPozos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `subproyectoId` int NOT NULL,
  `pozoId` int NOT NULL,
  `hojaId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `subproyecto-pozo` (`subproyectoId`,`pozoId`),
  KEY `mkPozos-subproyectos_idx` (`subproyectoId`),
  KEY `mkPozos-pozos_idx` (`pozoId`),
  CONSTRAINT `mkPozos-pozos` FOREIGN KEY (`pozoId`) REFERENCES `Pozos` (`Id`),
  CONSTRAINT `mkPozos-subproyectos` FOREIGN KEY (`subproyectoId`) REFERENCES `SubProyectos` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Muestras`
--

DROP TABLE IF EXISTS `Muestras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Muestras` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Tipo` int NOT NULL DEFAULT '1',
  `PozoId` int DEFAULT NULL,
  `CadenaCustodiaId` int NOT NULL,
  `Nombre` varchar(20) DEFAULT NULL,
  `NivelFreatico` decimal(8,3) DEFAULT NULL,
  `Profundidad` decimal(8,3) DEFAULT NULL,
  `FLNA` decimal(8,3) DEFAULT NULL,
  `CadenaOPDS` varchar(10) DEFAULT NULL,
  `ProtocoloOPDS` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `Muestras-Pozo_idx` (`PozoId`),
  KEY `Muestra-Cadena_idx` (`CadenaCustodiaId`),
  CONSTRAINT `Muestra-Cadena` FOREIGN KEY (`CadenaCustodiaId`) REFERENCES `CadenaCustodia` (`Id`),
  CONSTRAINT `Muestras-Pozo` FOREIGN KEY (`PozoId`) REFERENCES `Pozos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MuestrasProtocolo`
--

DROP TABLE IF EXISTS `MuestrasProtocolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MuestrasProtocolo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProtocoloId` int NOT NULL,
  `MuestraLab` varchar(20) DEFAULT NULL,
  `MuestraId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `MuestraProt_Muestra_idx` (`MuestraId`),
  KEY `MuestraProt_Protocolo_idx` (`ProtocoloId`),
  CONSTRAINT `MuestraProt_Muestra` FOREIGN KEY (`MuestraId`) REFERENCES `Muestras` (`Id`),
  CONSTRAINT `MuestraProt_Protocolo` FOREIGN KEY (`ProtocoloId`) REFERENCES `Protocolos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pozos`
--

DROP TABLE IF EXISTS `Pozos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pozos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `SubProyectoId` int NOT NULL,
  `Nombre` varchar(20) NOT NULL,
  `EstadoId` int NOT NULL DEFAULT '1',
  `TipoId` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  UNIQUE KEY `supProyecto_Pozo` (`SubProyectoId`,`Nombre`),
  KEY `Pozos-SubProyecto_idx` (`SubProyectoId`),
  KEY `Pozos-Estado_idx` (`EstadoId`),
  KEY `Pozos-Tipo_idx` (`TipoId`),
  CONSTRAINT `Pozos-Estado` FOREIGN KEY (`EstadoId`) REFERENCES `PozosEstado` (`Id`),
  CONSTRAINT `Pozos-SubProyecto` FOREIGN KEY (`SubProyectoId`) REFERENCES `SubProyectos` (`Id`),
  CONSTRAINT `Pozos-Tipo` FOREIGN KEY (`TipoId`) REFERENCES `PozosTipo` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PozosEstado`
--

DROP TABLE IF EXISTS `PozosEstado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PozosEstado` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PozosTipo`
--

DROP TABLE IF EXISTS `PozosTipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PozosTipo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Protocolos`
--

DROP TABLE IF EXISTS `Protocolos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Protocolos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(30) NOT NULL,
  `Fecha` date NOT NULL,
  `LaboratorioId` int NOT NULL,
  `EventoMuestreoId` int NOT NULL,
  `MatrizId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  UNIQUE KEY `Nombre_UNIQUE` (`Nombre`),
  KEY `Protocolo-Laboratorio_idx` (`LaboratorioId`),
  KEY `Protocolo-Evento_idx` (`EventoMuestreoId`),
  KEY `Protocolo-Matriz_idx` (`MatrizId`),
  CONSTRAINT `Protocolo-Evento` FOREIGN KEY (`EventoMuestreoId`) REFERENCES `EventoMuestreo` (`Id`),
  CONSTRAINT `Protocolo-Laboratorio` FOREIGN KEY (`LaboratorioId`) REFERENCES `Laboratorios` (`Id`),
  CONSTRAINT `Protocolo-Matriz` FOREIGN KEY (`MatrizId`) REFERENCES `Matriz` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Provincias`
--

DROP TABLE IF EXISTS `Provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Provincias` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Proyectos`
--

DROP TABLE IF EXISTS `Proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Proyectos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(10) NOT NULL,
  `Nombre` varchar(45) NOT NULL,
  `EstadoCodigo` int NOT NULL DEFAULT '1',
  `ClienteId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  UNIQUE KEY `Codigo_UNIQUE` (`Codigo`),
  KEY `Proyectos_Estado_idx` (`EstadoCodigo`),
  KEY `Proyecto_Cliente_idx` (`ClienteId`),
  CONSTRAINT `Proyecto_Cliente` FOREIGN KEY (`ClienteId`) REFERENCES `Clientes` (`Id`),
  CONSTRAINT `Proyectos_Estado` FOREIGN KEY (`EstadoCodigo`) REFERENCES `ProyectosEstado` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ProyectosEstado`
--

DROP TABLE IF EXISTS `ProyectosEstado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ProyectosEstado` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Codigo` int NOT NULL,
  `Nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Codigo_UNIQUE` (`Codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Regulados`
--

DROP TABLE IF EXISTS `Regulados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Regulados` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `AutAplicacionId` int NOT NULL,
  `FechaVigencia` date NOT NULL,
  `CompuestoId` int NOT NULL,
  `Norma` varchar(45) DEFAULT NULL,
  `ValorReferencia` decimal(10,3) NOT NULL,
  `UMId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  KEY `Regulacion-AutAplicacion_idx` (`AutAplicacionId`),
  KEY `Regulacion-Compuesto_idx` (`CompuestoId`),
  KEY `Regulacion-UM_idx` (`UMId`),
  CONSTRAINT `Regulacion-AutAplicacion` FOREIGN KEY (`AutAplicacionId`) REFERENCES `AutAplicacion` (`Id`),
  CONSTRAINT `Regulacion-Compuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `Regulacion-UM` FOREIGN KEY (`UMId`) REFERENCES `UM` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3747 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `RelCompuestoGrupo`
--

DROP TABLE IF EXISTS `RelCompuestoGrupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RelCompuestoGrupo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `GrupoId` int NOT NULL,
  `CompuestoId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Unique` (`GrupoId`,`CompuestoId`),
  KEY `Rel_Compuesto_idx` (`CompuestoId`) /*!80000 INVISIBLE */,
  KEY `Rel_Grupo_idx` (`GrupoId`),
  CONSTRAINT `Rel_Compuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `Rel_Grupo` FOREIGN KEY (`GrupoId`) REFERENCES `GrupoCompuestos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=499 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ResultadosProtocolo`
--

DROP TABLE IF EXISTS `ResultadosProtocolo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ResultadosProtocolo` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ItemProtocoloId` int NOT NULL,
  `MuestraProtocoloId` int NOT NULL,
  `Valor` decimal(7,3) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `ResultadosProt-ItemProt_idx` (`ItemProtocoloId`),
  KEY `ResultadosProt-MuestraProt_idx` (`MuestraProtocoloId`),
  CONSTRAINT `ResultadosProt-ItemProt` FOREIGN KEY (`ItemProtocoloId`) REFERENCES `ItemsProtocolo` (`Id`),
  CONSTRAINT `ResultadosProt-MuestraProt` FOREIGN KEY (`MuestraProtocoloId`) REFERENCES `MuestrasProtocolo` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=888 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SinonimosCompuestos`
--

DROP TABLE IF EXISTS `SinonimosCompuestos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SinonimosCompuestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `TextoLab` varchar(60) NOT NULL,
  `TextoProcesado` varchar(60) NOT NULL,
  `CompuestoId` int NOT NULL,
  `MatrizId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TextoProcesado_UNIQUE` (`TextoProcesado`,`MatrizId`),
  KEY `SinonimoC-Compuesto_idx` (`CompuestoId`),
  KEY `SinonimoC-Matriz_idx` (`MatrizId`),
  CONSTRAINT `SinonimoC-Compuesto` FOREIGN KEY (`CompuestoId`) REFERENCES `Compuestos` (`Id`),
  CONSTRAINT `SinonimoC-Matriz` FOREIGN KEY (`MatrizId`) REFERENCES `Matriz` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=503 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SinonimosMetodos`
--

DROP TABLE IF EXISTS `SinonimosMetodos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SinonimosMetodos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TextoLab` varchar(60) NOT NULL,
  `TextoProcesado` varchar(60) NOT NULL,
  `MetodoId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `TextoProcesado_UNIQUE` (`TextoProcesado`),
  KEY `SinonimoM-Metodo_idx` (`MetodoId`),
  CONSTRAINT `SinonimoM-Metodo` FOREIGN KEY (`MetodoId`) REFERENCES `Metodos` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=290 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='		';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SinonimosUM`
--

DROP TABLE IF EXISTS `SinonimosUM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SinonimosUM` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `TextoLab` varchar(10) NOT NULL,
  `TextoProcesado` varchar(10) NOT NULL,
  `UmId` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `SinonimoUM-UM_idx` (`UmId`),
  CONSTRAINT `SinonimoUM-UM` FOREIGN KEY (`UmId`) REFERENCES `UM` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SubProyectos`
--

DROP TABLE IF EXISTS `SubProyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SubProyectos` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ProyectoId` int NOT NULL,
  `Codigo` varchar(10) NOT NULL,
  `NombreLocacion` varchar(45) DEFAULT NULL,
  `Ubicacion` varchar(45) DEFAULT NULL,
  `AutAplicacionAguaId` int NOT NULL,
  `APIES` varchar(10) DEFAULT NULL,
  `Objetivo` varchar(45) DEFAULT NULL,
  `Notas` varchar(60) DEFAULT NULL,
  `AutAplicacionSueloId` int NOT NULL,
  `AutAplicacionGasesId` int NOT NULL,
  `AutAplicacionFLNAId` int NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`),
  UNIQUE KEY `Codigo_UNIQUE` (`Codigo`),
  KEY `SubProyecto-Proyecto_idx` (`ProyectoId`),
  KEY `SupProyecto-AutAplicacion_idx` (`AutAplicacionAguaId`),
  KEY `Subproyecto-AutAplicacionSuelo_idx` (`AutAplicacionSueloId`),
  KEY `Subproyecto-AutAplicacionFLNA_idx` (`AutAplicacionFLNAId`),
  KEY `Subproyecto-AutAplicacion-Gases_idx` (`AutAplicacionGasesId`),
  CONSTRAINT `Subproyecto-AutAplicacion-Gases` FOREIGN KEY (`AutAplicacionGasesId`) REFERENCES `AutAplicacion` (`Id`),
  CONSTRAINT `Subproyecto-AutAplicacionFLNA` FOREIGN KEY (`AutAplicacionFLNAId`) REFERENCES `AutAplicacion` (`Id`),
  CONSTRAINT `Subproyecto-AutAplicacionSuelo` FOREIGN KEY (`AutAplicacionSueloId`) REFERENCES `AutAplicacion` (`Id`),
  CONSTRAINT `SubProyecto-Proyecto` FOREIGN KEY (`ProyectoId`) REFERENCES `Proyectos` (`Id`),
  CONSTRAINT `SupProyecto-AutAplicacionAgua` FOREIGN KEY (`AutAplicacionAguaId`) REFERENCES `AutAplicacion` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=266 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UM`
--

DROP TABLE IF EXISTS `UM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UM` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(10) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Usuarios`
--

DROP TABLE IF EXISTS `Usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuarios` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Mail` varchar(60) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Password` varchar(64) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Id_UNIQUE` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-25 16:50:19
