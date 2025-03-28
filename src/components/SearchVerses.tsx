"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Search } from "lucide-react";

interface SearchResult {
  book_name: string;
  chapter_number: number;
  verse_number: number;
  text: string;
  rank?: number;
}

export default function SearchVerses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/search?query=${encodeURIComponent(
          searchQuery,
        )}&limit=50`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search the Bible..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {error && <p className="text-destructive mb-4">{error}</p>}

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader className="">
                <CardTitle className="text-md font-bold">
                  {result.book_name} {result.chapter_number}:
                  {result.verse_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p>{result.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        !isLoading &&
        searchQuery.trim() !== "" && (
          <p className="text-muted-foreground text-center">
            No verses found matching your search.
          </p>
        )
      )}

      {!searchQuery.trim() && !isLoading && results.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Enter a word or phrase to search the Bible
          </p>
        </div>
      )}
    </div>
  );
}
