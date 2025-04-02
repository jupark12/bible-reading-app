import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { BibleSelector } from "./common/bible-selector";
import NotesEditor from "./common/NotesEditor";
import { toast } from "sonner"; // Ensure sonner is installed and configured

interface BibleReaderProps {
  setCurrentDevotional: React.Dispatch<React.SetStateAction<Devotional | null>>;
  currentDevotional: Devotional | null;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  setCurrentDevotional,
  currentDevotional,
}) => {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState("1");
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<Verse[][]>([]);
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);

  const MAX_FAVORITES = 5; // Define the maximum limit

  // --- Fetch Verses ---
  const fetchVerses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        // Ensure your API endpoint exists and is correct
        // Consider using environment variables for the base URL
        `http://localhost:8000/verses/${encodeURIComponent(book)}/${encodeURIComponent(chapter)}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Verse[] = await response.json(); // Assuming API returns Verse[]

      // Chunking logic
      const verseChunks: Verse[][] = [];
      for (let i = 0; i < data.length; i += 5) {
        verseChunks.push(data.slice(i, i + 5));
      }
      setChunks(verseChunks);
    } catch (error) {
      console.error("Error fetching verses:", error);
      toast.error("Failed to load verses. Please try again."); // User-friendly error
      setChunks([]); // Clear chunks on error
    } finally {
      setLoading(false);
    }
  };

  // --- Effect for fetching verses when book/chapter changes ---
  useEffect(() => {
    fetchVerses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter]); // Dependencies: fetch verses when book or chapter changes

  useEffect(() => {
    setFavorites(currentDevotional?.favorite_verses || []);
  }, []);

  // --- Handle Book/Chapter Selection ---
  const handleSelectionChange = (
    selectedBook: string,
    selectedChapter: string,
  ) => {
    setBook(selectedBook);
    setChapter(selectedChapter);
  };

  // --- Handle Verse Click (Add/Remove Favorite) ---
  const handleVerseClick = (verse: Verse) => {
    const currentChapterNumber = parseInt(chapter, 10); // Ensure chapter is a number

    // Check if verse already exists in favorites using its unique ID
    const verseExistsIndex = favorites.findIndex(
      (fav) => fav.verse_id === verse.id,
    );

    if (verseExistsIndex !== -1) {
      // --- Verse already favorited: Remove it ---
      setFavorites(favorites.filter((_, index) => index !== verseExistsIndex));
    } else {
      // --- Verse not favorited: Try to add it ---
      if (favorites.length >= MAX_FAVORITES) {
        // Check if limit is reached
        toast.error(
          `Maximum of ${MAX_FAVORITES} favorite verses reached for today's devotional.`,
        );
      } else {
        // Limit not reached: Add the new favorite verse
        setFavorites([
          ...favorites,
          {
            verse_id: verse.id,
            verse_number: verse.verse_number,
            text: verse.text,
            book_name: book, // Current book
            chapter_number: currentChapterNumber, // Current chapter number
            devotional_id: currentDevotional?.devotional_id || 0, // Add devotional_id from current devotional
          },
        ]);
      }
    }
  };

  // Helper to check if a verse is currently favorited for highlighting
  const isFavorited = (verseId: number): boolean => {
    return favorites.some((fav) => fav.verse_id === verseId);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] w-full" // Added border for visual separation
    >
      {/* Left Panel: Bible Reader */}
      <ResizablePanel defaultSize={50} minSize={25}>
        <div className="flex h-full flex-col p-4">
          {" "}
          {/* Use flex-col for layout */}
          <div className="mb-4 flex w-full justify-center">
            <BibleSelector
              onSelectionChange={handleSelectionChange}
              initialBook={book}
              initialChapter={chapter}
            />
          </div>
          {/* Scrollable Verse Area */}
          <div className="flex-grow overflow-y-auto">
            {" "}
            {/* Make this part scrollable */}
            {loading ? (
              <div className="flex h-full items-center justify-center">
                Loading verses...
              </div>
            ) : chunks.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                No verses found.
              </div>
            ) : (
              chunks.map((chunk, chunkIndex) => (
                <p
                  key={chunkIndex}
                  className="verse-paragraph mb-2 leading-relaxed"
                >
                  {" "}
                  {/* Add margin-bottom */}
                  {chunk.map((verse, index) => (
                    <span
                      key={verse.id} // Use unique verse ID as key
                      className="verse hover:text-primary cursor-pointer" // Use theme color on hover
                      onClick={() => handleVerseClick(verse)}
                      title={`Click to ${isFavorited(verse.id) ? "remove from" : "add to"} favorites`} // Tooltip
                    >
                      <span
                        className={`verse-number text-muted-foreground mr-1 align-super text-xs ${index === 0 ? "ml-4" : ""}`} // Use theme color, adjust margin
                      >
                        {verse.verse_number}
                      </span>
                      {isFavorited(verse.id) ? (
                        <mark className="bg-accent text-accent-foreground rounded px-1">
                          {" "}
                          {/* Style the highlight */}
                          {verse.text}
                        </mark>
                      ) : (
                        verse.text
                      )}{" "}
                      {/* Add space after each verse */}
                    </span>
                  ))}
                </p>
              ))
            )}
          </div>
        </div>
      </ResizablePanel>

      {/* Handle */}
      <ResizableHandle withHandle />

      {/* Right Panel: Notes Editor */}
      <ResizablePanel defaultSize={50} minSize={25}>
        {/* Ensure NotesEditor is wrapped in a layout container if needed */}
        <div className="h-full">
          <NotesEditor
            currentDevotional={currentDevotional}
            favorites={favorites}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
