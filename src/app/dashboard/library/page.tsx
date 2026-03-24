
"use client"

import { useState, useMemo } from 'react';
import { 
  Library, 
  Plus, 
  Download, 
  Search, 
  Scan, 
  BookOpen, 
  Trash2, 
  Loader2, 
  Database,
  CheckCircle2,
  FileText,
  Info
} from 'lucide-react';
import { useDatabase, useRTDBCollection, useUserProfile } from '@/firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { operationsService } from '@/services/operations';
import { Book } from '@/lib/types';

export default function DigitalLibraryPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isbn, setIsbn] = useState('');
  
  // Book Form State
  const [bookData, setBookData] = useState<Partial<Book>>({
    title: '',
    author: '',
    category: 'General',
    coverUrl: ''
  });

  const database = useDatabase();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { data: books, loading } = useRTDBCollection<Book>(database, 'library_books');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

  const filteredBooks = useMemo(() => {
    return books.filter(b => 
      b.title?.toLowerCase().includes(search.toLowerCase()) || 
      b.author?.toLowerCase().includes(search.toLowerCase()) ||
      b.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [books, search]);

  const handleFetchMetadata = async () => {
    if (!isbn) return;
    setIsFetching(true);
    try {
      const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await response.json();
      const bookInfo = data[`ISBN:${isbn}`];
      
      if (bookInfo) {
        setBookData({
          title: bookInfo.title || '',
          author: bookInfo.authors?.[0]?.name || 'Unknown Author',
          coverUrl: bookInfo.cover?.large || bookInfo.cover?.medium || '',
          category: bookInfo.subjects?.[0]?.name || 'Academic'
        });
        toast({ title: "Metadata Retrieved", description: `Found: ${bookInfo.title}` });
      } else {
        toast({ title: "Not Found", description: "ISBN not found in database. Manual entry required.", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "API Error", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data: Omit<Book, 'id' | 'createdAt'> = {
      title: bookData.title || formData.get('title') as string,
      author: bookData.author || formData.get('author') as string,
      isbn: isbn || formData.get('isbn') as string,
      coverUrl: bookData.coverUrl || '',
      category: formData.get('category') as string,
      downloadUrl: formData.get('url') as string || '#',
      addedBy: profile?.displayName || 'System'
    };

    try {
      await operationsService.addBook(database, data);
      setIsAddOpen(false);
      setBookData({ title: '', author: '', coverUrl: '', category: 'General' });
      setIsbn('');
      toast({ title: "Book Added", description: `"${data.title}" is now in the library.` });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this resource from library?')) return;
    try {
      await operationsService.deleteBook(database, id);
      toast({ title: "Resource Removed" });
    } catch (e) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <Library className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Institutional Digital Library</h2>
            <p className="text-sm text-white/80 mt-1">Access curriculum resources, textbooks, and academic journals</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 backdrop-blur-md">
              <Database className="w-3.5 h-3.5" /> Repository Live
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input className="pl-9 text-xs h-9" placeholder="Search by title, author, or category..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 h-9 text-xs font-bold gap-1.5 shadow-sm">
                <Plus className="h-3.5 w-3.5" /> Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <form onSubmit={handleAddBook}>
                <DialogHeader>
                  <DialogTitle>Register Library Resource</DialogTitle>
                  <DialogDescription>Use ISBN to automatically fetch book details or enter manually.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>ISBN Code Entry</Label>
                      <div className="relative">
                        <Scan className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input 
                          placeholder="e.g. 9780131103627" 
                          className="pl-8" 
                          value={isbn}
                          onChange={(e) => setIsbn(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleFetchMetadata} 
                      disabled={!isbn || isFetching} 
                      className="mt-8 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch Info'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <div className="space-y-2">
                      <Label>Book Title</Label>
                      <Input name="title" value={bookData.title} onChange={(e) => setBookData({...bookData, title: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input name="author" value={bookData.author} onChange={(e) => setBookData({...bookData, author: e.target.value})} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select name="category" defaultValue={bookData.category || 'General'}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Textbook">Textbook</SelectItem>
                          <SelectItem value="Fiction">Fiction</SelectItem>
                          <SelectItem value="Academic Journal">Journal</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Language">Language</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Download/Access URL</Label>
                      <Input name="url" placeholder="https://cloud.school.edu/book.pdf" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Confirm Library Addition
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600" /></div>
        ) : filteredBooks.length > 0 ? filteredBooks.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
            <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden flex items-center justify-center">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <BookOpen className="h-12 w-12 text-gray-200" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <a 
                  href={book.downloadUrl || '#'} 
                  className="p-3 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform shadow-lg"
                  title="Download Resource"
                >
                  <Download className="h-5 w-5" />
                </a>
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(book.id)}
                    className="p-3 bg-white rounded-full text-rose-600 hover:scale-110 transition-transform shadow-lg"
                    title="Delete Resource"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[9px] font-bold text-gray-600 uppercase shadow-sm">
                {book.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{book.title}</h4>
              <p className="text-[11px] text-gray-500 font-medium">{book.author}</p>
              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> ISBN: {book.isbn || 'N/A'}</span>
                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Digital</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            <Library className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No resources found in the library registry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
