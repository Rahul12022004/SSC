import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextSelection } from "@tiptap/pm/state";

import "@/styles/richTextBlocks.css";
import {
  areBlockContentsEqual,
  blocksToTiptapDoc,
  editorDocToBlocks,
} from "@/common/utils/richTextBlocks";

const SLASH_COMMANDS = [
  {
    id: "paragraph",
    label: "Text",
    description: "Plain paragraph",
    keywords: ["text", "paragraph"],
    run: (chain) => chain.setParagraph(),
  },
  {
    id: "heading-1",
    label: "Heading 1",
    description: "Large section title",
    keywords: ["heading", "h1", "title"],
    run: (chain) => chain.setHeading({ level: 1 }),
  },
  {
    id: "heading-2",
    label: "Heading 2",
    description: "Strong subsection title",
    keywords: ["heading", "h2"],
    run: (chain) => chain.setHeading({ level: 2 }),
  },
  {
    id: "heading-3",
    label: "Heading 3",
    description: "Medium heading",
    keywords: ["heading", "h3"],
    run: (chain) => chain.setHeading({ level: 3 }),
  },
  {
    id: "heading-4",
    label: "Heading 4",
    description: "Compact heading",
    keywords: ["heading", "h4"],
    run: (chain) => chain.setHeading({ level: 4 }),
  },
  {
    id: "bullet",
    label: "Bullet list",
    description: "Bulleted items",
    keywords: ["bullet", "list", "unordered"],
    run: (chain) => chain.setParagraph().toggleBulletList(),
  },
  {
    id: "numbered",
    label: "Numbered list",
    description: "Ordered items",
    keywords: ["numbered", "ordered", "list"],
    run: (chain) => chain.setParagraph().toggleOrderedList(),
  },
  {
    id: "table",
    label: "Table",
    description: "Insert a table",
    keywords: ["table", "grid", "data"],
    run: (chain) => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
  },
];

const getMatchingCommands = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return SLASH_COMMANDS;

  return SLASH_COMMANDS.filter((command) => {
    const haystack = [command.label, command.description, ...command.keywords]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
};

const shouldRemoveEmptyBlock = (state) => {
  const { selection, doc } = state;
  const { $from, empty } = selection;

  if (!empty || $from.depth < 1 || doc.childCount <= 1) return null;

  const topNode = $from.node(1);
  const isSupportedTextBlock =
    topNode.type.name === "paragraph" || topNode.type.name === "heading";

  if (!isSupportedTextBlock || topNode.textContent.length > 0) return null;

  return {
    from: $from.start(1) - 1,
    to: $from.start(1) - 1 + topNode.nodeSize,
  };
};

function RichTextEditor({
  value,
  onChange,
  placeholder = "Type your question here",
  minHeight = 150,
  ariaLabel = "Rich text editor",
}) {
  const editorRef = useRef(null);
  const menuRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const slashRangeRef = useRef(null);
  const menuStateRef = useRef({
    open: false,
    query: "",
    selectedIndex: 0,
  });
  const filteredCommandsRef = useRef(SLASH_COMMANDS);

  const [menuState, setMenuState] = useState({
    open: false,
    query: "",
    selectedIndex: 0,
    position: { top: 0, left: 0 },
  });

  const filteredCommands = useMemo(
    () => getMatchingCommands(menuState.query),
    [menuState.query],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    menuStateRef.current = menuState;
  }, [menuState]);

  useEffect(() => {
    filteredCommandsRef.current = filteredCommands;
  }, [filteredCommands]);

  const closeMenu = useCallback(() => {
    slashRangeRef.current = null;
    setMenuState((previous) => (
      previous.open
        ? {
            ...previous,
            open: false,
            query: "",
            selectedIndex: 0,
          }
        : previous
    ));
  }, []);

  const executeCommand = useCallback((command) => {
    if (!editorRef.current || !slashRangeRef.current) return;

    const range = slashRangeRef.current;
    const chain = editorRef.current
      .chain()
      .focus()
      .deleteRange(range);

    command.run(chain).run();
    closeMenu();
  }, [closeMenu]);

  const syncSlashMenu = useCallback((editor) => {
    if (!editor) return;

    const { state, view } = editor;
    const { selection } = state;

    if (!selection.empty) {
      closeMenu();
      return;
    }

    const { $from, from } = selection;
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, "\n", "\0");
    const match = textBefore.match(/(?:^|\s)(\/[^\s/]*)$/);

    if (!match) {
      closeMenu();
      return;
    }

    const slashText = match[1];
    const query = slashText.slice(1);
    const commandMatches = getMatchingCommands(query);
    const coords = view.coordsAtPos(from);
    const nextLeft = Math.min(coords.left, Math.max(24, window.innerWidth - 280));
    const nextSelectedIndex = Math.min(
      menuStateRef.current.selectedIndex,
      Math.max(commandMatches.length - 1, 0),
    );

    slashRangeRef.current = {
      from: from - slashText.length,
      to: from,
    };

    setMenuState({
      open: true,
      query,
      selectedIndex: nextSelectedIndex,
      position: {
        top: coords.bottom + 10,
        left: nextLeft,
      },
    });
  }, [closeMenu]);

  const editor = useEditor({
    immediatelyRender: false,
    content: blocksToTiptapDoc(value),
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'rich-editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class: "rich-editor__content",
        "aria-label": ariaLabel,
        "data-placeholder": placeholder,
      },
      handleKeyDown(view, event) {
        const currentMenuState = menuStateRef.current;
        const currentCommands = filteredCommandsRef.current;

        if (currentMenuState.open) {
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            setMenuState((previous) => ({
              ...previous,
              selectedIndex:
                currentCommands.length === 0
                  ? 0
                  : (previous.selectedIndex + 1) % currentCommands.length,
            }));
            return true;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setMenuState((previous) => ({
              ...previous,
              selectedIndex:
                currentCommands.length === 0
                  ? 0
                  : (previous.selectedIndex - 1 + currentCommands.length) %
                    currentCommands.length,
            }));
            return true;
          }

          if (event.key === "Enter") {
            if (!currentCommands.length) return true;
            event.preventDefault();
            executeCommand(currentCommands[currentMenuState.selectedIndex] || currentCommands[0]);
            return true;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
            return true;
          }
        }

        if (event.key === "Backspace") {
          const range = shouldRemoveEmptyBlock(view.state);
          if (!range) return false;

          event.preventDefault();
          let transaction = view.state.tr.delete(range.from, range.to);
          const target = Math.max(0, Math.min(range.from, transaction.doc.content.size));
          transaction = transaction.setSelection(
            TextSelection.near(transaction.doc.resolve(target)),
          );
          view.dispatch(transaction.scrollIntoView());
          closeMenu();
          return true;
        }

        return false;
      },
    },
    onCreate: ({ editor: nextEditor }) => {
      editorRef.current = nextEditor;
    },
    onSelectionUpdate: ({ editor: nextEditor }) => {
      editorRef.current = nextEditor;
      syncSlashMenu(nextEditor);
    },
    onUpdate: ({ editor: nextEditor }) => {
      editorRef.current = nextEditor;
      onChangeRef.current(editorDocToBlocks(nextEditor.getJSON()));
      syncSlashMenu(nextEditor);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const currentBlocks = editorDocToBlocks(editor.getJSON());
    if (areBlockContentsEqual(currentBlocks, value)) return;

    editor.commands.setContent(blocksToTiptapDoc(value), false);
  }, [editor, value]);

  useEffect(() => {
    if (!menuState.open) return undefined;

    const handleMouseDown = (event) => {
      if (menuRef.current?.contains(event.target)) return;
      closeMenu();
    };

    const handleResize = () => closeMenu();

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [closeMenu, menuState.open]);

  return (
    <div className="rich-editor" style={{ "--rich-editor-min-height": `${minHeight}px` }}>
      <div className="rich-editor__surface">
        <EditorContent editor={editor} />
      </div>

      {editor && editor.isActive('table') && (
        <div className="rich-editor__table-controls">
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="table-control-btn"
            title="Add column before"
          >
            ← Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="table-control-btn"
            title="Add column after"
          >
            Col →
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="table-control-btn"
            title="Add row before"
          >
            ↑ Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="table-control-btn"
            title="Add row after"
          >
            Row ↓
          </button>
          <div className="table-control-divider"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'left').run()}
            className="table-control-btn"
            title="Align left"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'center').run()}
            className="table-control-btn"
            title="Align center"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'right').run()}
            className="table-control-btn"
            title="Align right"
          >
            ➡
          </button>
          <div className="table-control-divider"></div>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="table-control-btn table-control-btn-danger"
            title="Delete column"
          >
            ✕ Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="table-control-btn table-control-btn-danger"
            title="Delete row"
          >
            ✕ Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="table-control-btn table-control-btn-danger"
            title="Delete table"
          >
            ✕ Table
          </button>
        </div>
      )}

      <div className="rich-editor__hint">
        Type <span>/</span> for headings and lists
      </div>

      {menuState.open && (
        <div
          ref={menuRef}
          className="rich-editor__menu"
          style={{
            top: `${menuState.position.top}px`,
            left: `${menuState.position.left}px`,
          }}
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                type="button"
                className={`rich-editor__menu-item ${
                  menuState.selectedIndex === index ? "is-selected" : ""
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  executeCommand(command);
                }}
              >
                <span className="rich-editor__menu-title">{command.label}</span>
                <span className="rich-editor__menu-desc">{command.description}</span>
              </button>
            ))
          ) : (
            <div className="rich-editor__menu-empty">No matching command</div>
          )}
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;
