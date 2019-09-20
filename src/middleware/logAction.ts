import {SystemLog} from "../models/systemLog.model";

export const logAction = async (causer: string, description: string) => {
  try {
    const doc = new SystemLog({
      description: description,
      causer: causer
    });
    await doc.save();
  } catch (e) {
    throw e;
  }
}
