import assert from 'assert'
import { MongoClient, Db } from 'mongodb';
import { getEnv } from './env';

let _db: Db;

function initDb(callback: any) {
    let env = getEnv()
    console.log("Intializing connection to db...")
    if (_db) {
        console.warn("Trying to init DB again!");
        return callback(null, _db);
    }
    MongoClient.connect(env.dbUrl)
        .then(client => {
            console.log("here")
            _db = client.db(env.dbName);
            console.log(`Connected to DB: ${env.dbName}`);
            _db;
            return callback(null, _db);
        })
        .catch(err => {
            console.log("there")
            console.log(env.dbUrl)
            console.error('Failed to connect to MongoDB', err);
            // process.exit(1); // Terminate the process with an error code
        });
}

function getDb() {
    assert.ok(_db, "Db has not been initialized. Please called init first.");
    return _db;
}

export {
    getDb, initDb
}