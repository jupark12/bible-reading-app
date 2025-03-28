import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "./NotesEditor.css"; // Custom styles
import { SlashCommand } from "./SlashCommand";

const NotesEditor: React.FC = () => {
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
    onTransaction: () => {
      // Force update when editor state changes
      console.log("Editor updated");
    },
  });

  if (!editor) return null;

  return (
    <div>
      <EditorContent editor={editor} className="border p-6" />
    </div>
  );
};

export default NotesEditor;
