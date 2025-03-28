"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { bibleBooks } from "../../lib/utils";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface BibleSelectorProps {
  onSelectionChange: (book: string, chapter: string) => void;
  initialBook?: string;
  initialChapter?: string;
}

export function BibleSelector({
  onSelectionChange,
  initialBook = "Genesis",
  initialChapter = "1",
}: BibleSelectorProps) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);

  // Get the number of chapters for the selected book
  const selectedBookData = bibleBooks.find(
    (book) => book.name === selectedBook,
  );
  const totalChapters = selectedBookData ? selectedBookData.chapters : 0;

  // Generate chapter numbers based on total chapters
  const chapterNumbers = Array.from({ length: totalChapters }, (_, i) =>
    (i + 1).toString(),
  );

  // Update parent component when selection changes
  useEffect(() => {
    onSelectionChange(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter, onSelectionChange]);

  // Handle book selection
  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter("1"); // Reset to chapter 1 when book changes
    setIsBookDropdownOpen(false);
  };

  // Handle chapter selection
  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(chapter);
    setIsChapterDropdownOpen(false);
  };

  return (
    <div className="flex space-x-2">
      {/* Book Selector */}
      <DropdownMenu
        open={isBookDropdownOpen}
        onOpenChange={setIsBookDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          >
            {selectedBook}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] w-56 overflow-y-auto">
          <DropdownMenuLabel>Select Book</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedBook}
            onValueChange={handleBookChange}
          >
            {bibleBooks.map((book) => (
              <DropdownMenuRadioItem key={book.name} value={book.name}>
                {book.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Chapter Selector */}
      <DropdownMenu
        open={isChapterDropdownOpen}
        onOpenChange={setIsChapterDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          >
            Chapter {selectedChapter}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] w-56 overflow-y-auto">
          <DropdownMenuLabel>{selectedBook} Chapters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedChapter}
            onValueChange={handleChapterChange}
          >
            {chapterNumbers.map((chapter) => (
              <DropdownMenuRadioItem key={chapter} value={chapter}>
                Chapter {chapter}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
