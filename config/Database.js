import 'dotenv/config';
import mysql from 'mysql2';

class DataBase {
    constructor() {
        // Configuración de la conexión a la base de datos
        // Pool de conexiones para soportar concurrencia
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT, // ahora se incluye el puerto
            waitForConnections: true,
            connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
            queueLimit: 0
        });

        // Conexión a la base de datos
        this.conectar();
    }

    conectar() {
        this.pool.getConnection((error, conn) => {
            if (error) {
                console.error('Error al conectar a la base de datos:', error);
                return;
            }
            console.log('\nConexión exitosa al pool de MySQL.\n');
            conn.release();
        });
    }

    cerrarConexion() {
        this.pool.end((error) => {
            if (error) {
                console.error('Error al cerrar el pool de conexiones MySQL:', error);
                return;
            }
            console.log('Pool de conexiones MySQL cerrado correctamente.\n');
        });
    }

    // Método para ejecutar consultas SQL
    async ejecutarQuery(query, params) {
        return new Promise((resolve, reject) => {
            this.pool.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DataBase();
        }
        return this.instance;
    }
}

export default DataBase;

// Cierre ordenado del pool cuando el proceso termina
if (!global.__db_shutdown_hook) {
    global.__db_shutdown_hook = true;
    const closePool = () => {
        try {
            const db = DataBase.instance;
            if (db && db.pool) {
                db.cerrarConexion();
            }
        } catch (_) { /* noop */ }
    };
    process.on('SIGINT', () => { closePool(); process.exit(0); });
    process.on('SIGTERM', () => { closePool(); process.exit(0); });
    process.on('beforeExit', () => { closePool(); });
}