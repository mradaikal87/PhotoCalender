import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ev = { img: string; note: string };

const DATA_FILE = path.join(process.cwd(), "data", "events.json");
const IMG_DIR = path.join(process.cwd(), "public", "event");
const validDate = (d: string) => /^2027-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d);

async function readAll(): Promise<Record<string, Ev>> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, Ev>) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));
}

export async function GET() {
  return NextResponse.json(await readAll());
}

// Save note + (optional) photo for one date. Photo goes to public/event/<date>.jpg
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const date = String(form.get("date") ?? "");
  if (!validDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const note = String(form.get("note") ?? "").trim().slice(0, 140);
  const file = form.get("image");
  const all = await readAll();
  let img = all[date]?.img ?? "";

  if (file instanceof File && file.size > 0) {
    await fs.mkdir(IMG_DIR, { recursive: true });
    await fs.writeFile(path.join(IMG_DIR, `${date}.jpg`), Buffer.from(await file.arrayBuffer()));
    img = `/event/${date}.jpg?v=${Date.now()}`; // ?v= busts the browser cache
  } else if (form.get("removeImage") === "1") {
    await fs.rm(path.join(IMG_DIR, `${date}.jpg`), { force: true });
    img = "";
  }

  if (!img && !note) delete all[date];
  else all[date] = { img, note };
  await writeAll(all);
  return NextResponse.json(all);
}

export async function DELETE(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!validDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  const all = await readAll();
  delete all[date];
  await fs.rm(path.join(IMG_DIR, `${date}.jpg`), { force: true });
  await writeAll(all);
  return NextResponse.json(all);
}
