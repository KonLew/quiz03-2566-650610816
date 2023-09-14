import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  const roomId = request.nextUrl.searchParams.get("roomId");
  readDB();
  const rm = DB.rooms.find((x) => x.roomId === roomId);
  if (!rm)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const messages = [];
  for (const ms of DB.messages) {
    if (ms.roomId === rm.roomId) messages.push(ms);
  }
  return NextResponse.json(
    {
      ok: true,
      message: messages,
    },
    { status: 200 }
  );
};

export const POST = async (request) => {
  readDB();
  const body = await request.json();
  const { roomId, messageText } = body;
  const rm = DB.rooms.find((x) => x.roomId === roomId);
  if (!rm)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const messageId = nanoid();
  DB.messages.push({
    roomId,
    messageId,
    messageText,
  });
  writeDB();

  return NextResponse.json({
    ok: true,
    messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();
  const body = await request.json();
  // console.log(payload.role);
  readDB();
  const { messageId } = body;
  const ms = DB.messages.find((x) => x.messageId === messageId);

  if (payload === null)
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );

  if (payload.role !== "SUPER_ADMIN")
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );

  if (!ms)
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );
  const foundIndex = DB.messages.findIndex((x) => x.messageId === ms.messageId);
  DB.messages.splice(foundIndex, 1);
  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
