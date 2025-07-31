"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Heart, FileText, Star, AlertCircle, Circle, Minus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Note {
  id: string
  title: string
  content: string
  priority: "low" | "medium" | "high"
  isDraft: boolean
  isFavourite: boolean
  createdAt: string
  updatedAt: string
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    isDraft: false,
    isFavourite: false,
  })
  const { toast } = useToast()

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      const data = await response.json()
      setNotes(data.notes || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
    }
  }

  // Filter notes based on active tab and search term
  useEffect(() => {
    let filtered = notes

    // Filter by tab
    switch (activeTab) {
      case "drafts":
        filtered = notes.filter((note) => note.isDraft)
        break
      case "favourites":
        filtered = notes.filter((note) => note.isFavourite)
        break
      default:
        filtered = notes
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort by priority and date
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    setFilteredNotes(filtered)
  }, [notes, activeTab, searchTerm])

  useEffect(() => {
    fetchNotes()
  }, [])

  // Create or update note
  const saveNote = async () => {
    try {
      const noteData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        ...(editingNote ? { id: editingNote.id } : { createdAt: new Date().toISOString() }),
      }

      const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes"
      const method = editingNote ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      })

      if (response.ok) {
        fetchNotes()
        setIsDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: `Note ${editingNote ? "updated" : "created"} successfully`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchNotes()
        toast({
          title: "Success",
          description: "Note deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  // Toggle favourite
  const toggleFavourite = async (note: Note) => {
    try {
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...note,
          isFavourite: !note.isFavourite,
          updatedAt: new Date().toISOString(),
        }),
      })
      if (response.ok) {
        fetchNotes()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "medium",
      isDraft: false,
      isFavourite: false,
    })
    setEditingNote(null)
  }

  const openEditDialog = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      priority: note.priority,
      isDraft: note.isDraft,
      isFavourite: note.isFavourite,
    })
    setIsDialogOpen(true)
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "medium":
        return <Minus className="w-4 h-4 text-yellow-500" />
      case "low":
        return <Circle className="w-4 h-4 text-green-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-600 mt-1">Organize your thoughts and ideas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter note title..."
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note here..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="draft"
                      checked={formData.isDraft}
                      onCheckedChange={(checked) => setFormData({ ...formData, isDraft: checked })}
                    />
                    <Label htmlFor="draft">Save as draft</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="favourite"
                      checked={formData.isFavourite}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFavourite: checked })}
                    />
                    <Label htmlFor="favourite">Add to favourites</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveNote}>{editingNote ? "Update" : "Create"} Note</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <FileText className="w-4 h-4" />
              All Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <Edit className="w-4 h-4" />
              Drafts ({notes.filter((n) => n.isDraft).length})
            </TabsTrigger>
            <TabsTrigger value="favourites" className="gap-2">
              <Heart className="w-4 h-4" />
              Favourites ({notes.filter((n) => n.isFavourite).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No notes found" : `No ${activeTab === "all" ? "notes" : activeTab} yet`}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first note to get started"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavourite(note)}>
                            <Heart
                              className={`w-4 h-4 ${note.isFavourite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                            />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(note)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(note.priority)}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(note.priority)}
                            <span className="capitalize">{note.priority}</span>
                          </div>
                        </Badge>
                        {note.isDraft && (
                          <Badge variant="secondary">
                            <Edit className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                        {note.isFavourite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{note.content}</p>
                      <p className="text-xs text-gray-400">Updated {new Date(note.updatedAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
