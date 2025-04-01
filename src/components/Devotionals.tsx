import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import "../styles/Devotionals.css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { CornerDownRight, Loader, PanelRight } from "lucide-react";

export default function Devotionals() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [selectedDevotional, setSelectedDevotional] = useState<
    Devotional | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDevotionals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/devotionals", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data: Devotional[] = await response.json();

      // Sort again client-side just to be absolutely sure (optional)
      data.sort(
        (a, b) =>
          new Date(b.devotional_date).getTime() -
          new Date(a.devotional_date).getTime(),
      );

      setDevotionals(data);

      // Set the initially selected devotional to the most recent one
      if (data.length > 0) {
        setSelectedDevotional(data[0]);
      } else {
        setSelectedDevotional(undefined); // Handle case with no devotionals
      }
    } catch (err) {
      toast.error("Failed to fetch devotionals");
      setDevotionals([]);
      setSelectedDevotional(undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevotionals();
  }, [fetchDevotionals]);

  const handleDateClick = (devotional: Devotional) => {
    setSelectedDevotional(devotional);
  };

  const formatDate = (dateString: string): string => {
    try {
      // Convert the string date to a Date object first
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC", // Specify UTC if dates from backend are timezone naive YYYY-MM-DD
      });
    } catch (e) {
      toast.error("Error formatting date");
      return dateString;
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <Loader className="absolute top-3 right-3" size={25} />;
  }

  if (!devotionals.length) {
    return (
      <div className="devotional-viewer empty">
        No devotionals found for this user.
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[200px] w-full rounded-lg"
    >
      <ResizablePanel defaultSize={20} minSize={20}>
        <div className="devotional-list-panel mr-6 p-6">
          <h2 className="mb-2 text-2xl font-bold">History</h2>
          <hr></hr>
          <ul className="mt-4">
            {devotionals.map((dev) => (
              <li key={dev.devotional_id} className="pb-4">
                <button
                  onClick={() => handleDateClick(dev)}
                  className={
                    selectedDevotional?.devotional_id === dev.devotional_id
                      ? "text-foreground font-bold"
                      : "text-foreground/50 cursor-pointer"
                  }
                  title={`View devotional for ${formatDate(dev.devotional_date)}`}
                >
                  {formatDate(dev.devotional_date)}
                </button>
                <div className="flex gap-6">
                  <CornerDownRight size={15} />
                  <div className="text-foreground/50 text-sm">
                    {dev.favorite_verses && dev.favorite_verses.length > 0 ? (
                      <ol className="list-decimal pl-4">
                        {dev.favorite_verses.slice(0, 5).map((verse, index) => (
                          <li key={index}>
                            {verse.book_name} {verse.chapter_number}:
                            {verse.verse_number}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <span>No favorite verses</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80} minSize={50}>
        <div className="devotional-content-panel flex-1 p-6">
          {selectedDevotional ? (
            <>
              <h3 className="text-primary italic">
                {"Devotional on " +
                  formatDate(selectedDevotional.devotional_date)}
              </h3>
              {/*
              WARNING: Only use dangerouslySetInnerHTML if you trust the source
              of selectedDevotional.reflection. It can expose you to XSS attacks
              if the HTML contains malicious scripts and isn't properly sanitized
              before being stored in the database.
            */}
              <div
                className="reflection-content p-5"
                dangerouslySetInnerHTML={{
                  __html: selectedDevotional.reflection,
                }}
              />
            </>
          ) : (
            <p>Select a date from the list to view the devotional.</p>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
