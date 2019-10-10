import {SystemLog} from "../models/systemLog.model";

export const logAction = async (causer: string, description: string, ip: string) => {
  try {
    const doc = new SystemLog({
      description: description,
      causer: causer,
      from: ip
    });
    console.log(`log: ${causer} ${description} ${ip}`);
    await doc.save();
  } catch (e) {
    throw e;
  }
}
