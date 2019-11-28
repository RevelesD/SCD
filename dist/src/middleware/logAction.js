"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const systemLog_model_1 = require("../models/systemLog.model");
exports.logAction = async (causer, queryType, queryName, description, ip) => {
    // console.log(causer);
    try {
        const doc = new systemLog_model_1.SystemLog({
            description: description,
            causer: causer,
            from: ip,
            requestType: queryType,
            requestName: queryName
        });
        await doc.save();
    }
    catch (e) {
        throw e;
    }
};
function registerBadLog(context, qType, qName) {
    // console.log('Bad Log');
    let mensaje;
    if (context.user.isAuth === undefined) {
        mensaje = 'Access denied due to lack of credentials';
        exports.logAction('Unauthenticated', qType, qName, mensaje, context.user.ip);
        return mensaje;
    }
    else {
        mensaje = `Requested the action without sufficient permissions`;
        exports.logAction(context.user.userId, qType, qName, mensaje, context.user.ip);
    }
    return mensaje;
}
exports.registerBadLog = registerBadLog;
function registerGoodLog(context, qType, qName, oid) {
    // console.log('Good Log');
    // console.log(context);
    exports.logAction(context.user.userId, qType, qName, `Query resolved successfully on ${oid}`, context.user.ip);
}
exports.registerGoodLog = registerGoodLog;
function registerErrorLog(context, qType, qName, err) {
    // console.log('Error Log');
    exports.logAction(context.user.userId, qType, qName, err, context.user.ip);
}
exports.registerErrorLog = registerErrorLog;
function registerGenericLog(context, qType, qName, message) {
    exports.logAction(context.user.userId, qType, qName, message, context.user.ip);
}
exports.registerGenericLog = registerGenericLog;
//# sourceMappingURL=logAction.js.map