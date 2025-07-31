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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const db = readDB()

    const noteIndex = db.notes.findIndex((note: any) => note.id === params.id)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    db.notes[noteIndex] = {
      ...db.notes[noteIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    writeDB(db)

    return NextResponse.json(db.notes[noteIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = readDB()

    const noteIndex = db.notes.findIndex((note: any) => note.id === params.id)
    if (noteIndex === -1) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    db.notes.splice(noteIndex, 1)
    writeDB(db)

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
