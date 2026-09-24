import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const zipPath = path.join(process.cwd(), 'public', 'food-wastage-detection.zip');

  if (!fs.existsSync(zipPath)) {
    return NextResponse.json(
      { error: 'Project zip file not found. Please trigger zip generation.' },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(zipPath);
  const stat = fs.statSync(zipPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="food-wastage-detection.zip"',
      'Content-Length': stat.size.toString(),
      'Cache-Control': 'no-cache',
    },
  });
}
