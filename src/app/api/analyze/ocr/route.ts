import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan" },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    const [result] = await client.textDetection({
      image: { content: bytes },
    });

    const text = result.fullTextAnnotation?.text || "";

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "OCR gagal" },
      { status: 500 }
    );
  }
}