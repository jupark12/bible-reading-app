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
    title: "Heading 1",
    command: (editor) => {
      console.log("Executing Heading 1 command");
      return editor.commands.toggleHeading({ level: 1 });
    },
  },
  {
    title: "Heading 2",
    command: (editor) => {
      console.log("Executing Heading 2 command");
      return editor.commands.toggleHeading({ level: 2 });
    },
  },
  {
    title: "Bullet List",
    command: (editor) => {
      console.log("Executing Bullet List command");
      return editor.commands.toggleBulletList();
    },
  },
  {
    title: "Numbered List",
    command: (editor) => {
      console.log("Executing Numbered List command");
      return editor.commands.toggleOrderedList();
    },
  },
  {
    title: "Horizontal Rule",
    command: (editor) => {
      console.log("Executing Horizontal Rule command");
      return editor.commands.setHorizontalRule();
    },
  },
  {
    title: "Undo",
    command: (editor) => {
      console.log("Executing Undo command");
      return editor.commands.undo();
    },
  },
  {
    title: "Redo",
    command: (editor) => {
      console.log("Executing Redo command");
      return editor.commands.redo();
    },
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
    backgroundColor: isSelected ? "var(--accent)" : "transparent",
    color: isSelected ? "var(--accent-foreground)" : "var(--foreground)",
    fontWeight: isSelected ? "bold" : "normal",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "4px",
    margin: "2px 0",
  });

  // In the SlashMenu component's useEffect for keyboard handling
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
        e.stopPropagation(); // Stop propagation to prevent the Enter from creating a new line
        // Ensure we don't try to access an undefined option
        const item = items[selectedIndex];
        if (item) {
          command(item);
        }
      }
    };

    // Use capture phase to ensure our handler runs before the editor's handler
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [selectedIndex, items, command]);

  return (
    <div
      className="slash-menu"
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
        minWidth: "180px",
        zIndex: 1000,
        padding: "4px",
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
            <span
              style={{ fontSize: "0.8em", color: "var(--muted-foreground)" }}
            >
              ↵
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export { SlashCommand, SlashMenu };
