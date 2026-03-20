"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = 4000;
console.log("🚀 STARTING SERVER...");
app_1.default.listen(PORT, "0.0.0.0", () => {
    console.log("✅ RUNNING ON", PORT);
});
//# sourceMappingURL=server.js.map