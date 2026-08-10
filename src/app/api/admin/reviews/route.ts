import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviews } = body;

    return NextResponse.json({
      success: true,
      message: "Reviews updated successfully",
      reviews,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update reviews" },
      { status: 500 }
    );
  }
}
