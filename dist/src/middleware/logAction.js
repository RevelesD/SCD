"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const systemLog_model_1 = require("../models/systemLog.model");
exports.logAction = async (causer, description, ip) => {
    try {
        const doc = new systemLog_model_1.SystemLog({
            description: description,
            causer: causer,
            from: ip
        });
        console.log(`log: ${causer} ${description} ${ip}`);
        await doc.save();
    }
    catch (e) {
        throw e;
    }
};
//# sourceMappingURL=logAction.js.map