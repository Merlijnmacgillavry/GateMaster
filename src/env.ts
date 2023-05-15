let _env: Environment

function initEnv() {
    _env = new Environment()
}
function getEnv() {
    return _env;
}

class Environment {
    environment: string;
    jwtSecret: string;
    dbUrl: string;
    dbName: string;
    constructor() {
        this.environment = process.env.ENVIRONMENT || "dev";
        this.jwtSecret = process.env.JWT_SECRET || "supersecretsecret";
        this.dbUrl = "mongodb://localhost:27017"
        this.dbName = "Db"
    }
}
export {
    Environment, initEnv, getEnv
}