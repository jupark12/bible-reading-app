import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { BibleSelector } from "./common/bible-selector";

interface Verse {
  verse_number: number;
  text: string;
}

export default function BibleReader() {
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState("1");
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [chunks, setChunks] = useState<Verse[][]>([]);

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

  console.log(chunks, verses);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <BibleSelector
          onSelectionChange={handleSelectionChange}
          initialBook={book}
          initialChapter={chapter}
        />
      </div>
      <div className="flex max-w-[600px] flex-col">
        {chunks.map((chunk, chunkIndex) => (
          <p key={chunkIndex} className="verse-paragraph">
            {chunk.map((verse, index) => (
              // Add tab to first verse in each paragraph
              <span key={index} className="verse">
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
  );
}
