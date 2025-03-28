import React, { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { BibleSelector } from "./common/bible-selector";
import NotesEditor from "./common/NotesEditor";

interface Verse {
  verse_number: number;
  text: string;
}

interface FavoriteVerse {
  verse_number: number;
  text: string;
  book: string;
  chapter: number;
}

export default function BibleReader() {
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
    console.log("Verse clicked:", verse);
    setFavorites([
      ...favorites,
      {
        verse_number: verse.verse_number,
        text: verse.text,
        book: book,
        chapter: parseInt(chapter),
      },
    ]);
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] max-w-md rounded-lg md:min-w-fit"
    >
      <ResizablePanel defaultSize={50}>
        <div className="container mx-auto p-6">
          <div className="mb-6">
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
                    {verse.text}{" "}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <NotesEditor />
        <div className="flex flex-col p-6">
          <h4 className="flex justify-center py-6 text-xl font-bold">
            Favorite Verses
          </h4>
          {favorites.map((favorite) => (
            <div key={favorite.verse_number}>
              {favorite.book} {favorite.chapter} {favorite.verse_number}:{" "}
              {favorite.text}
            </div>
          ))}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
