### Armado de base de datos BFU con un contenedor de Docker

1. Crear el directorio donde se guardaran las bases (ej: c:\Database\mysql-data) y otro para el archivo de configuracion (c:\Database\mysql-config)

2. Crear archivo de configuracion de MySQL (ej: my_custom.cnf) en c:\Database\mysql-config .  
   El contenido del archivo debe ser:
   [mysqld]
   lower_case_table_names=1
   Se puede crear con un editor como notepad++ o desde ubuntu / git bash con:
   cat > /c/Database/mysql-config/my_custom.cnf << 'EOF'
   [mysqld]
   lower_case_table_names=1
   EOF
3. Crear el contenedor:   
    docker run --name mysql-for-bfu -e MYSQL_ROOT_PASSWORD=NetronaMySQL -v "C:/Database/mysql-data:/var/lib/mysql" -v "C:/Database/mysql-config/my_custom.cnf:/etc/mysql/conf.d/my_custom.cnf" -p 3306:3306 -d mysql:8.0

   Nota: el config es para setear la el estado lower_case_table_names=1, en linux/docker el default parece ser 0 y hace a las tablas case-sensitive, nosotros necesitamos que no lo sean
   la intentamos configurar en 1.. No sabemos por que igual esto las setea en 2 que parece ser el parametro que efectivamente las hace insensibles.
   Si mysql se instala desde windows sin docker, el default parece ser 1.
   0: Table and database names are stored on disk using the lettercase specified in the CREATE TABLE or CREATE DATABASE statement.
   Name comparisons are case-sensitive. You should not set this variable to 0 if you are running MySQL on a system that has case-insensitive file names (such as Windows or macOS).
   If you force this variable to 0 with --lower-case-table-names=0 on a case-insensitive file system and access MyISAM tablenames using different lettercases, index corruption may result.
   1: Table names are stored in lowercase on disk and name comparisons are not case-sensitive. MySQL converts all table names to lowercase on storage and lookup.
   This behavior also applies to database names and table aliases.
   2: Table and database names are stored on disk using the lettercase specified in the CREATE TABLE or CREATE DATABASE statement, but MySQL converts them to lowercase on lookup.
   Name comparisons are not case-sensitive. This works only on file systems that are not case-sensitive!
   InnoDB table names and view names are stored in lowercase, as for lower_case_table_names=1.

4. Crear la base de datos a partir del script de creacion
   En BFU-ProtocolManager/back/sql estan los scripts:
   - bfu-project-db-struct.sql (Estructura de la base)
   - bfu-project-db-MasterData.sql (Datos Maestros -seeds-)
     Desde Workbench ir a Server -> Data Import -> Import from Self-Contained File y seleccionar primero la estructura y luego los datos maestros
   Esto se puede hacer tambien desde la linea de comandos con:
   - docker exec -i mysql-for-bfu mysql -uroot -pNetronaMySQL < ruta/a/bfu-project-db-struct.sql
   - docker exec -i mysql-for-bfu mysql -uroot -pNetronaMySQL < ruta/a/bfu-project-db-MasterData.sql
5. Crear el usuario netrona y asignarle permisos
   En Workbench: conectarse a la base de datos como usuario root pass NetronaMySQL
   Administation -> Users and Privileges ->
   add account:
   login name: netrona
   authentification type: standard
   Limit to ..: % (permite conexiones desde cualquier host, cambiarlo si se quiere que solo de algun host se pueda)
   password: netrona-01
   Nota: este usuario y contraseña deben estar en el .env del backend
   Solapa: Schema Privileges -> Add Entry -> seleccionar bfu-project-db
   Select All ("SELECT", "INSERT", "UPDATE", "DELETE", "EXECUTE", "CREATE", "DROP", "REFERENCES", "INDEX", "ALTER", "CREATE VIEW", "SHOW VIEW", "TRIGGER" ...)
   Apply
   Tambien se puede hacer por linea de comandos:
   - docker exec -it mysql-for-bfu mysql -uroot -pNetronaMySQL
     dentro del contenedor:
     CREATE USER 'netrona'@'%' IDENTIFIED BY 'netrona-01';
     GRANT ALL PRIVILEGES ON `bfu-project-db`.\* TO 'netrona'@'%';
     FLUSH PRIVILEGES;
     EXIT;
