"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = exports.initEnv = exports.Environment = void 0;
let _env;
function initEnv() {
    _env = new Environment();
}
exports.initEnv = initEnv;
function getEnv() {
    return _env;
}
exports.getEnv = getEnv;
class Environment {
    environment;
    jwtSecret;
    dbUrl;
    dbName;
    constructor() {
        this.environment = process.env.ENVIRONMENT || "dev";
        this.jwtSecret = process.env.JWT_SECRET || "supersecretsecret";
        this.dbUrl = "mongodb://localhost:27017";
        this.dbName = "Db";
    }
}
exports.Environment = Environment;
