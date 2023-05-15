"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = exports.getDb = void 0;
const assert_1 = __importDefault(require("assert"));
const mongodb_1 = require("mongodb");
const env_1 = require("./env");
let _db;
function initDb(callback) {
    let env = (0, env_1.getEnv)();
    console.log("Intializing connection to db...");
    if (_db) {
        console.warn("Trying to init DB again!");
        return callback(null, _db);
    }
    mongodb_1.MongoClient.connect(env.dbUrl)
        .then(client => {
        console.log("here");
        _db = client.db(env.dbName);
        console.log(`Connected to DB: ${env.dbName}`);
        _db;
        return callback(null, _db);
    })
        .catch(err => {
        console.log("there");
        console.log(env.dbUrl);
        console.error('Failed to connect to MongoDB', err);
        // process.exit(1); // Terminate the process with an error code
    });
}
exports.initDb = initDb;
function getDb() {
    assert_1.default.ok(_db, "Db has not been initialized. Please called init first.");
    return _db;
}
exports.getDb = getDb;
