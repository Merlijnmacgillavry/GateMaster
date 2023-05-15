
import * as fs from 'fs';
import { parse } from "dotenv";
import { User } from './models/user';

let _sM: ServiceManager;

function initSM() {
    _sM = new ServiceManager();
    _sM.load();
}

function getSM() {
    return _sM;
}

const DEFAULT_REFRESH_TIME = '15m'

class ServiceManager {
    services: Service[];

    constructor() {
        this.services = []
    }

    load(): void {
        let path = "src/config/dev.config.json";

        if (process.env.ENVIRONMENT === 'prod') {
            path = "src/config/prod.config.json";
        }
        let configServices = fs.readFileSync(path, 'utf-8');
        let parsedConfigServices = JSON.parse(configServices);
        for (let s of parsedConfigServices.services) {
            let refreshTime = DEFAULT_REFRESH_TIME;
            if (s.refreshTime) {
                refreshTime = s.refreshTime
            }
            this.add(new Service(s.name, s.endpoint, refreshTime))
        }
    }

    add(s: Service): void {
        this.services.push(s);
    }

    findByName(name: string): Service | undefined {
        for (let s of this.services) {
            if (s.name === name) {
                return s;
            }
        }
        return undefined
    }
}

class Service {
    name: string;
    endpoint: string;
    refreshTime: string | number;
    constructor(name: string, endpoint: string, refreshTime: string | number) {
        this.name = name;
        this.endpoint = endpoint;
        this.refreshTime = refreshTime;
    }
    // Method to authorize user based on role
    authorize(user: User) {
        return user.roles.includes(this.name);
    }
}

export { initSM, getSM, Service, ServiceManager }