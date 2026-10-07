import {NextResponse} from 'next/server'; import {cookieName} from '@/lib/admin';
export async function POST(){const r=NextResponse.json({ok:true});r.cookies.delete(cookieName);return r;}
