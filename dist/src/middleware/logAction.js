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
        await doc.save();
    }
    catch (e) {
        throw e;
    }
};
function registerLog(context, resolver) {
    if (context.user.isAuth === undefined) {
        exports.logAction('Unauthenticated', `Requested the ${resolver}`, context.user.ip);
    }
    else {
        exports.logAction(context.user.userId, `Requested the ${resolver} without sufficient permissions`, context.user.ip);
    }
}
exports.registerLog = registerLog;
//# sourceMappingURL=logAction.js.map