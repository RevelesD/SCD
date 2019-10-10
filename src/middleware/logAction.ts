import {SystemLog} from "../models/systemLog.model";
import {isAuth} from "./is-auth";
import {config} from "../../enviroments.dev";
import {ApolloError} from "apollo-server-errors";

export const logAction = async (causer: string, description: string, ip: string) => {
  try {
    const doc = new SystemLog({
      description: description,
      causer: causer,
      from: ip
    });
    await doc.save();
  } catch (e) {
    throw e;
  }
}

export function registerLog(context, resolver) {
  if (context.user.isAuth === undefined) {
    logAction('Unauthenticated', `Requested the ${resolver}`, context.user.ip)
  } else {
    logAction(context.user.userId,
      `Requested the ${resolver} without sufficient permissions`,
      context.user.ip)
  }
}
