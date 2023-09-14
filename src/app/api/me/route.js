import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Surangrat Teymeesak",
    studentId: "650610816",
  });
};
