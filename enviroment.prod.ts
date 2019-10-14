import * as fs from "fs";

export const privateKEY  = fs.readFileSync('./private.key', 'utf8');
export const publicKEY  = fs.readFileSync('./public.key', 'utf8');
