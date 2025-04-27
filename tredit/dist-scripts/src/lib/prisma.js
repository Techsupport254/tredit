"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var prisma = global.prisma || new client_1.PrismaClient();
exports.prisma = prisma;
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
exports.default = prisma;
