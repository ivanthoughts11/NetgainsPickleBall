import { NextResponse } from 'next/server'; import { prisma } from '@/lib/prisma';
export async function GET(){const court=await prisma.court.findFirst({where:{active:true}});return NextResponse.json(court);}
