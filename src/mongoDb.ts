import { MongoClient, Db } from 'mongodb';
import assert from 'assert'
import { getEnv } from './env';

let _db: Db;

function initDb(callback: any) {
    let env = getEnv()

    if (_db) {
        console.warn("Trying to init DB again!");
        return callback(null, _db);
    }
    MongoClient.connect(env.dbUrl)
        .then(client => {
            _db = client.db(env.dbName);
            console.log(`Connected to DB: ${env.dbName}`);
            _db;
            return callback(null, _db);
        })
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1); // Terminate the process with an error code
        });
}

function getDb() {
    assert.ok(_db, "Db has not been initialized. Please called init first.");
    return _db;
}

export {
    getDb, initDb
}