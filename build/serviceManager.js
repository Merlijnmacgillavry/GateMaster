"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = exports.Service = exports.getSM = exports.initSM = void 0;
const fs = __importStar(require("fs"));
let _sM;
function initSM() {
    _sM = new ServiceManager();
    _sM.load();
}
exports.initSM = initSM;
function getSM() {
    return _sM;
}
exports.getSM = getSM;
const DEFAULT_REFRESH_TIME = '15m';
class ServiceManager {
    services;
    constructor() {
        this.services = [];
    }
    load() {
        let path = "src/config/dev.config.json";
        if (process.env.ENVIRONMENT === 'prod') {
            path = "src/config/prod.config.json";
        }
        let configServices = fs.readFileSync(path, 'utf-8');
        let parsedConfigServices = JSON.parse(configServices);
        for (let s of parsedConfigServices.services) {
            let refreshTime = DEFAULT_REFRESH_TIME;
            if (s.refreshTime) {
                refreshTime = s.refreshTime;
            }
            this.add(new Service(s.name, s.endpoint, refreshTime));
        }
    }
    add(s) {
        this.services.push(s);
    }
    findByName(name) {
        for (let s of this.services) {
            if (s.name === name) {
                return s;
            }
        }
        return undefined;
    }
}
exports.ServiceManager = ServiceManager;
class Service {
    name;
    endpoint;
    refreshTime;
    constructor(name, endpoint, refreshTime) {
        this.name = name;
        this.endpoint = endpoint;
        this.refreshTime = refreshTime;
    }
    // Method to authorize user based on role
    authorize(user) {
        return user.roles.includes(this.name);
    }
}
exports.Service = Service;
