import {SystemLog} from "../models/systemLog.model";

export const logAction = async (causer: string,
                                queryType: string,
                                queryName: string,
                                description: string,
                                ip: string) => {
  try {
    const doc = new SystemLog({
      description: description,
      causer: causer,
      from: ip,
      requestType: queryType,
      requestName: queryName
    });
    await doc.save();
  } catch (e) {
    throw e;
  }
}

export function registerBadLog(context, qType, qName) {
  if (context.user.isAuth === undefined) {
    logAction('Unauthenticated', qType, qName,
      'Access denied due to lack of credentials', context.user.ip);
  } else {
    logAction(context.user.userId, qType, qName,
      `Requested the action without sufficient permissions`,
      context.user.ip)
  }
}
export function registerGoodLog(context, qType, qName, oid) {
  logAction(context.user.userId, qType, qName,
    `Query resolved successfully on ${oid}`, context.user.ip);
}

export function registerErrorLog(context, qType, qName, err) {
  logAction(context.user.userId, qType, qName,
    err, context.user.ip);
}

export function registerGenericLog(context, qType, qName, message) {
  logAction(context.user.userId, qType, qName, message, context.user.ip);
}
