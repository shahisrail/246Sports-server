"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm6crryf2',
    api_key: process.env.CLOUDINARY_API_KEY || '157947392252212',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'V4g1cdTYVe-kducPzNSdBn0HBfg',
    secure: true,
});
//# sourceMappingURL=cloudinary.js.map