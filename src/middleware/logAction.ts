import {SystemLog} from "../models/systemLog.model";

export const logAction = async (causer: string,
                                queryType: string,
                                queryName: string,
                                description: string,
                                ip: string) => {
  // console.log(causer);
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

export function registerBadLog(context, qType, qName): string {
  // console.log('Bad Log');
  let mensaje;
  if (context.user.isAuth === undefined) {
    mensaje = 'Access denied due to lack of credentials';
    logAction('Unauthenticated', qType, qName, mensaje, context.user.ip);
    return mensaje;
  } else {
    mensaje = `Requested the action without sufficient permissions`;
    logAction(context.user.userId, qType, qName, mensaje, context.user.ip)
  }
  return mensaje;
}
export function registerGoodLog(context, qType, qName, oid) {
  // console.log('Good Log');
  // console.log(context);
  logAction(context.user.userId, qType, qName,
    `Query resolved successfully on ${oid}`, context.user.ip);
}

export function registerErrorLog(context, qType, qName, err) {
  // console.log('Error Log');
  logAction(context.user.userId, qType, qName,
    err, context.user.ip);
}

export function registerGenericLog(context, qType, qName, message) {
  logAction(context.user.userId, qType, qName, message, context.user.ip);
}
