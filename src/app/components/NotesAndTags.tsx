import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  StickyNote, 
  Tag, 
  Plus, 
  X, 
  Edit,
  Trash2,
  Save,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';

interface Note {
  id: string;
  type: string;
  title: string;
  content: string;
  author: string;
  timestamp: Date;
  important: boolean;
  visibility: 'staff' | 'public';
}

interface NotesAndTagsProps {
  recordId: string;
  recordTitle: string;
}

const NOTE_TYPES = [
  { value: 'general', label: 'General Note' },
  { value: 'cataloging', label: 'Cataloging Note' },
  { value: 'binding', label: 'Binding' },
  { value: 'provenance', label: 'Provenance' },
  { value: 'reproduction', label: 'Reproduction' },
  { value: 'action', label: 'Action Note' },
  { value: 'copy-specific', label: 'Copy-Specific' },
];

const PREDEFINED_TAGS = [
  'urgent', 'review', 'incomplete', 'rare', 'fragile', 
  'special-collections', 'digitization', 'preservation',
  'deaccessioned', 'missing', 'damaged', 'restricted'
];

export function NotesAndTags({ recordId, recordTitle }: NotesAndTagsProps) {
  const { t } = useTranslation();
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      type: 'cataloging',
      title: 'Original cataloging',
      content: 'This record was created using original cataloging. Verified all fields against the physical item.',
      author: 'jdoe',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      important: false,
      visibility: 'staff'
    },
    {
      id: '2',
      type: 'action',
      title: 'Pending review',
      content: 'Subject headings need to be verified by subject specialist.',
      author: 'asmith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      important: true,
      visibility: 'staff'
    }
  ]);

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteForm, setNoteForm] = useState({
    type: 'general',
    title: '',
    content: '',
    important: false,
    visibility: 'staff' as 'staff' | 'public'
  });

  // Tags state
  const [tags, setTags] = useState<string[]>(['review', 'incomplete']);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Notes handlers
  const handleSaveNote = () => {
    if (!noteForm.title || !noteForm.content) return;

    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id 
        ? { ...n, ...noteForm, timestamp: new Date() }
        : n
      ));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteForm,
        author: 'current_user',
        timestamp: new Date(),
      };
      setNotes([newNote, ...notes]);
    }

    resetNoteForm();
    setIsNoteDialogOpen(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      type: note.type,
      title: note.title,
      content: note.content,
      important: note.important,
      visibility: note.visibility
    });
    setIsNoteDialogOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const resetNoteForm = () => {
    setEditingNote(null);
    setNoteForm({
      type: 'general',
      title: '',
      content: '',
      important: false,
      visibility: 'staff'
    });
  };

  // Tags handlers
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const filteredSuggestions = PREDEFINED_TAGS.filter(
    tag => !tags.includes(tag) && tag.includes(tagInput.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notes & Tags
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {recordTitle} (ID: {recordId})
          </p>
        </div>
      </div>

      <Tabs defaultValue="notes">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">
            <StickyNote className="h-4 w-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="tags">
            <Tag className="h-4 w-4 mr-2" />
            Tags ({tags.length})
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notes</CardTitle>
                <Dialog open={isNoteDialogOpen} onOpenChange={(open) => {
                  setIsNoteDialogOpen(open);
                  if (!open) resetNoteForm();
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingNote ? 'Edit Note' : 'Add New Note'}
                      </DialogTitle>
                      <DialogDescription>
                        Create a note to document important information about this record
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label>Note Type</Label>
                        <Select
                          value={noteForm.type}
                          onValueChange={(value) => setNoteForm({ ...noteForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {NOTE_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Title</Label>
                        <Input
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          placeholder="Brief title for this note..."
                        />
                      </div>

                      <div>
                        <Label>Content</Label>
                        <Textarea
                          value={noteForm.content}
                          onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                          placeholder="Enter detailed note content..."
                          rows={6}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={noteForm.important}
                            onCheckedChange={(checked) => setNoteForm({ ...noteForm, important: checked })}
                          />
                          <Label>Mark as Important</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label>Visibility:</Label>
                          <Select
                            value={noteForm.visibility}
                            onValueChange={(value: 'staff' | 'public') => 
                              setNoteForm({ ...noteForm, visibility: value })
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff Only</SelectItem>
                              <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsNoteDialogOpen(false);
                            resetNoteForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveNote}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {notes.map(note => (
                    <Card key={note.id} className={note.important ? 'border-orange-500' : ''}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {NOTE_TYPES.find(t => t.value === note.type)?.label}
                            </Badge>
                            {note.important && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Important
                              </Badge>
                            )}
                            <Badge variant="secondary">
                              {note.visibility}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {note.content}
                        </p>

                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {note.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {notes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notes yet. Add your first note to get started.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tag Input */}
              <div className="relative">
                <Label>Add Tag</Label>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 relative">
                    <Input
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowTagSuggestions(e.target.value.length > 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder="Type a tag and press Enter..."
                    />
                    
                    {/* Tag Suggestions */}
                    {showTagSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredSuggestions.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleAddTag(tag)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => handleAddTag(tagInput)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to see suggestions from predefined tags
                </p>
              </div>

              {/* Applied Tags */}
              <div>
                <Label>Applied Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[80px] p-3 border dark:border-gray-700 rounded-lg">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="pr-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-sm text-gray-500">No tags applied</span>
                  )}
                </div>
              </div>

              {/* Predefined Tags */}
              <div>
                <Label>Quick Add (Predefined Tags)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => handleAddTag(tag)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
