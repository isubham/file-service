import pkg from 'pg';
const { Client, Pool, PoolClient } = pkg;

class db {

    static pool;

    constructor(host, user, password, maxConnections, database) {
        if (db.pool == undefined) {
            db.pool = new Pool({
                host: host,
                user: user,
                password: password,
                max: maxConnections,
                database: database,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });
        }
    }



    getClient() {
        return db.pool.connect();
    }

    getPool() {
        return db.pool;
    }

    async getPoolClient() {
        await db.pool.connect();
    }


    async query(query, data) {
        try {
            const results = await db.pool.query(query, data)
            return results;
        } catch (e) {
        }
    }

    async transaction(query, data) {

        let poolClient;
        try {
            poolClient = await db.pool.connect();
            poolClient.query("BEGIN")
            const results = await poolClient.query(query, data)
            poolClient.query("COMMIT")
            poolClient.release();
            return results;
        } catch (e) {
            poolClient.query("ROLLBACK")
        }
    }

    async closePool() {
        try {
            // we can only end pool if totalCount and idleCount is same. i.e. there are no active clients.
            await db.pool.end(); // on remove gets called
        } catch (e) {
            console.log(e);
        }
    }

}

const storageDatabase = new db('localhost', 'subham', 'mysecretpassword', 100, 'storage');

export { storageDatabase };

