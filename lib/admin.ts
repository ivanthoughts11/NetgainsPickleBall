import { createHmac } from 'crypto';
export const cookieName='ng_admin';
const secret=()=>process.env.ADMIN_PASSWORD||'change-this-password';
export function token(){return createHmac('sha256',secret()).update('net-gains-admin').digest('hex');}
export function isValid(v:string|undefined){return !!v&&v===token();}
