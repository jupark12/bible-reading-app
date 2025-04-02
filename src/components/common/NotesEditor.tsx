import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "../../styles/NotesEditor.css"; // Custom styles
import { SlashCommand } from "./SlashCommand";
import { Undo2, Redo2 } from "lucide-react"; // Import icons
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface NotesEditorProps {
  currentDevotional: Devotional | null;
  favorites: FavoriteVerse[];
}
const NotesEditor: React.FC<NotesEditorProps> = ({
  currentDevotional,
  favorites,
}) => {
  // Format the current date as MM-DD-YY
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() is zero-indexed
  const day = today.getDate();
  const year = today.getFullYear().toString().slice(-2); // Get last 2 digits of year
  const formattedDate = `${month}/${day}/${year}`;

  const editor = useEditor({
    extensions: [
      StarterKit, // Use default StarterKit without configuration
      Placeholder.configure({
        placeholder: "Write notes or use / to insert a command...",
      }),
      SlashCommand,
    ],
    content: currentDevotional?.reflection
      ? currentDevotional.reflection
      : "<h1>Scripture:{book} {chapter}</h3><p></p><p></p><h2>Observations:</h2><p></p><p></p><hr><h2>Reflections:</h2><p></p><p></p><hr><h2>Applications:</h2><p></p><p></p><hr>",
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  const saveDevotional = async () => {
    if (!editor) {
      return;
    }

    const devotionalContent = editor.getHTML();

    try {
      // Add try...catch for fetch errors
      const response = await fetch("http://localhost:8000/devotionals/save", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reflection: devotionalContent,
          favorite_verses: favorites.map(({ verse_id }) => verse_id),
        }),
      });

      if (response.ok) {
        toast.success("Devotional saved successfully!");
      } else {
        // Handle specific errors if possible
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error saving devotional." }));
        console.error("Error saving devotional:", response.status, errorData);
        toast.error(
          `Error saving devotional: ${errorData.detail || response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Network or other error saving devotional:", error);
      toast.error("A network error occurred while saving.");
    }
  };

  if (!editor) return null;

  return (
    <div className="">
      <div className="">
        <h3 className="bold flex w-full justify-center py-6 text-2xl font-bold">
          Devotional - {formattedDate}
        </h3>
        <div className="relative left-0 mx-2.5 mb-1 flex justify-between space-x-2 align-middle">
          <div>
            <button
              onClick={() => editor.commands.undo()}
              className="text-secondary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer rounded p-1.5 text-sm"
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={() => editor.commands.redo()}
              className="text-secondary-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer rounded p-1.5 text-sm"
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
          <div>
            <Button
              onClick={() => saveDevotional()}
              variant="outline"
              className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="m-4 border-t-2 border-b-2 border-dashed py-6"
      />

      <div className="flex flex-col p-6">
        <h4 className="flex justify-center py-6 text-xl font-bold">
          Favorite Verses
        </h4>
        <div className="space-y-4">
          {favorites.map((favorite, index) => (
            <Card key={index}>
              <CardHeader className="">
                <CardTitle className="text-md font-bold">
                  {favorite.book_name} {favorite.chapter_number}:
                  {favorite.verse_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p>{favorite.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesEditor;
