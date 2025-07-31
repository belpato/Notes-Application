import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const dbPath = path.join(process.cwd(), "db.json")

function readDB() {
  try {
    const data = fs.readFileSync(dbPath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return { notes: [] }
  }
}

function writeDB(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export async function GET() {
  try {
    const db = readDB()
    return NextResponse.json(db)
  } catch (error) {
    return NextResponse.json({ error: "Failed to read notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const db = readDB()

    const newNote = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.notes.push(newNote)
    writeDB(db)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
