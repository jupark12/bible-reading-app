import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./NotesEditor.css"; // Custom styles
import { SlashCommand } from "./SlashCommand";
import { Undo2, Redo2 } from "lucide-react"; // Import icons

const NotesEditor: React.FC = () => {
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
        placeholder: "Write your notes about this passage...",
      }),
      SlashCommand,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="">
      <div className="">
        <h3 className="bold flex w-full justify-center pt-6 text-2xl font-bold">
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
            <button
              onClick={() => console.log("saving note")}
              className="bg-accent text-secondary-foreground hover:bg-primary hover:text-accent-foreground mr-1.5 cursor-pointer rounded p-1.5 text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <EditorContent editor={editor} className="p-6" />
    </div>
  );
};

export default NotesEditor;
