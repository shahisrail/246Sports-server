"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const v1_routes_1 = __importDefault(require("./routes/v1.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// debug log
app.use((req, _res, next) => {
    console.log("➡️", req.method, req.url);
    next();
});
// routes
app.use("/api/v1", v1_routes_1.default);
// health
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is running 🚀",
    });
});
app.get("/", (_req, res) => {
    res.send("API running 🚀");
});
exports.default = app;
//# sourceMappingURL=app.js.map