import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionOptions } from "@tiptap/suggestion";
import tippy from "tippy.js";
import type { Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";
import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/core";

// Define available commands
type CommandOption = {
  title: string;
  command: (editor: Editor) => void;
};

const options: CommandOption[] = [
  {
    title: "Heading 2",
    command: (editor) => {
      console.log("Executing Heading 2 command");
      // Try a more direct approach with explicit focus
      return editor.commands.toggleHeading({ level: 2 });
    },
  },
  {
    title: "Bullet List",
    command: (editor) => {
      console.log("Executing Bullet List command");
      // Try a more direct approach with explicit focus
      return editor.commands.toggleBulletList();
    },
  },
  {
    title: "Italic",
    command: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    title: "Bold",
    command: (editor) => editor.chain().focus().toggleBold().run(),
  },
];

// Slash command extension
const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        items: () => options,
        // This is the critical method that executes when a suggestion is selected
        command: ({ editor, range, props }: any) => {
          // Delete the slash command input
          editor.chain().focus().deleteRange(range).run();

          // Execute the command immediately
          props.command(editor);
        },
        render: () => {
          let popup: ReactRenderer;
          let tippyInstance: Instance | null = null;
          let destroyed = false;

          return {
            onStart: (props) => {
              const { editor, clientRect } = props;
              destroyed = false;

              // Create the React renderer for the menu
              popup = new ReactRenderer(SlashMenu, {
                props: {
                  editor,
                  items: options,
                  command: (item: CommandOption) => {
                    // Set destroyed flag to prevent further updates
                    destroyed = true;

                    // Call the command method from the Suggestion plugin
                    // This will handle deleting the input and running the command
                    props.command(item);

                    // Clean up
                    if (tippyInstance) {
                      tippyInstance.destroy();
                      tippyInstance = null;
                    }
                    popup.destroy();
                  },
                },
                editor,
              });

              // Only create tippy instance if clientRect exists
              if (clientRect && clientRect()) {
                // Ensure clientRect is a function that returns a DOMRect
                const getReferenceClientRect = () => {
                  const rect = clientRect();
                  // Return an empty DOMRect if clientRect returns null
                  return rect || new DOMRect(0, 0, 0, 0);
                };

                tippyInstance = tippy(editor.view.dom as Element, {
                  getReferenceClientRect,
                  appendTo: document.body,
                  content: popup.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              }
            },
            onUpdate: (props) => {
              const { clientRect } = props;

              // Skip updates if destroyed
              if (destroyed || !tippyInstance || !clientRect || !clientRect()) {
                return;
              }

              // Ensure we're handling potential null correctly
              const getReferenceClientRect = () => {
                const rect = clientRect();
                return rect || new DOMRect(0, 0, 0, 0);
              };

              // Update the position
              tippyInstance.setProps({
                getReferenceClientRect,
              });
            },
            onKeyDown: ({ event }) => {
              if (destroyed) {
                return false;
              }

              if (event.key === "Escape") {
                if (tippyInstance) {
                  tippyInstance.hide();
                }
                return true;
              }
              return false;
            },
            onExit: () => {
              destroyed = true;
              if (tippyInstance) {
                tippyInstance.destroy();
                tippyInstance = null;
              }

              if (popup) {
                popup.destroy();
              }
            },
          };
        },
      } as SuggestionOptions),
    ];
  },
});

// Props for the SlashMenu component
interface SlashMenuProps {
  editor: Editor;
  items: CommandOption[];
  command: (item: CommandOption) => void;
}

// Slash menu component
const SlashMenu: React.FC<SlashMenuProps> = ({ editor, items, command }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Add CSS for the visual selection indicator
  const menuItemStyle = (isSelected: boolean) => ({
    padding: "8px 12px",
    cursor: "pointer",
    backgroundColor: isSelected ? "#e9ecef" : "transparent",
    fontWeight: isSelected ? "bold" : "normal",
    borderLeft: isSelected ? "2px solid #007bff" : "2px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }

      if (e.key === "Enter") {
        e.preventDefault();
        // Ensure we don't try to access an undefined option
        const item = items[selectedIndex];
        if (item) {
          command(item);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIndex, items, command]);

  return (
    <div
      className="slash-menu"
      style={{
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "180px",
        zIndex: 1000,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={menuItemStyle(index === selectedIndex)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            command(item);
          }}
          onMouseEnter={() => setSelectedIndex(index)}
          className="slash-item"
        >
          <span>{item.title}</span>
          {index === selectedIndex && (
            <span style={{ fontSize: "0.8em", color: "#666" }}>↵</span>
          )}
        </div>
      ))}
    </div>
  );
};

export { SlashCommand, SlashMenu };
