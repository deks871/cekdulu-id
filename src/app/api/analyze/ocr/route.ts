import { NextRequest, NextResponse } from "next/server";
import { analyzeScam } from "@/lib/scamAnalyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Teks tidak valid atau tidak ditemukan" },
        { status: 400 }
      );
    }

    const analysis = analyzeScam(text);

    console.log("OCR TEXT:", text);
    console.log("OCR ANALYSIS:", analysis);

    const responseData: any = {
      success: true,
      text,
      score: analysis.score,
      category: analysis.label,
      analysis: analysis.reasons.length > 0 
        ? "Ditemukan pola yang mencurigakan." 
        : "Tidak ditemukan pola penipuan yang jelas.",
      details: analysis.reasons,
    };

    if (process.env.NODE_ENV === "development") {
      responseData.debug = {
        textLength: analysis.textLength,
        normalizedText: analysis.normalizedText,
        categoryDetails: analysis.categoryDetails,
        combosBonuses: analysis.combosBonuses,
      };
    }

    return NextResponse.json(responseData);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Analisis gagal" },
      { status: 500 }
    );
  }
}