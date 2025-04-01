import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { BibleSelector } from "./common/bible-selector";
import NotesEditor from "./common/NotesEditor";

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
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<Verse[][]>([]);
  const [favorites, setFavorites] = useState<FavoriteVerse[]>([]);

  const fetchVerses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/verses/${book}/${chapter}`,
      );
      const data = await response.json();
      const chunks = [];
      for (let i = 0; i < data.length; i += 5) {
        chunks.push(data.slice(i, i + 5));
      }
      setChunks(chunks);
      setVerses(data);
    } catch (error) {
      console.error("Error fetching verses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerses();
  }, [book, chapter]);

  const handleSelectionChange = (
    selectedBook: string,
    selectedChapter: string,
  ) => {
    setBook(selectedBook);
    setChapter(selectedChapter);
  };

  const handleVerseClick = (verse: Verse) => {
    // Check if verse already exists in favorites
    const verseExists = favorites.some(
      (fav) =>
        fav.book === book &&
        fav.chapter === parseInt(chapter) &&
        fav.verse_number === verse.verse_number,
    );

    // Only add if it doesn't already exist
    if (!verseExists) {
      console.log("Verse added to favorites:", verse);
      setFavorites([
        ...favorites,
        {
          verse_number: verse.verse_number,
          text: verse.text,
          book: book,
          chapter: parseInt(chapter),
        },
      ]);
    } else {
      console.log("Verse already in favorites");
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] w-full rounded-lg"
    >
      <ResizablePanel defaultSize={50} minSize={25}>
        <div className="container mx-auto p-6">
          <div className="mb-6 flex w-full justify-center">
            <BibleSelector
              onSelectionChange={handleSelectionChange}
              initialBook={book}
              initialChapter={chapter}
            />
          </div>
          <div className="flex flex-col">
            {chunks.map((chunk, chunkIndex) => (
              <p key={chunkIndex} className="verse-paragraph">
                {chunk.map((verse, index) => (
                  // Add tab to first verse in each paragraph
                  <span
                    key={index}
                    className="verse cursor-pointer hover:underline"
                    onClick={() => {
                      handleVerseClick(verse);
                    }}
                  >
                    <span
                      className={
                        "verse-number align-super text-sm text-gray-500" +
                        (index == 0 ? " ml-4" : "")
                      }
                    >
                      {verse.verse_number}
                    </span>{" "}
                    {favorites.some(
                      (fav) =>
                        fav.book === book &&
                        fav.chapter === parseInt(chapter) &&
                        fav.verse_number === verse.verse_number,
                    ) ? (
                      <mark className="bg-accent text-accent-foreground">
                        {verse.text}
                      </mark>
                    ) : (
                      verse.text
                    )}{" "}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={25}>
        <NotesEditor
          setCurrentDevotional={setCurrentDevotional}
          currentDevotional={currentDevotional}
          favorites={favorites}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
