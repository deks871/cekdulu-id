import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import { analyzeScam } from "@/lib/scamAnalyzer";

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

    const analysis = analyzeScam(text);

    return NextResponse.json({
      success: true,
      text,
      score: analysis.score,
      label: analysis.label,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "OCR gagal" },
      { status: 500 }
    );
  }
}