const BLOCK_TYPES = new Set(["paragraph", "heading", "bullet", "numbered", "table"]);
const HEADING_LEVELS = new Set([1, 2, 3, 4]);

const normalizeText = (value) => (typeof value === "string" ? value : "");

const sanitizeBlock = (block) => {
  if (!block || typeof block !== "object") return null;

  const type = BLOCK_TYPES.has(block.type) ? block.type : null;
  if (!type) return null;

  const text = normalizeText(block.text);

  if (type === "heading") {
    const level = Number(block.level);
    return {
      type,
      level: HEADING_LEVELS.has(level) ? level : 1,
      text,
    };
  }

  if (type === "table") {
    return {
      type,
      rows: Array.isArray(block.rows) ? block.rows : [],
    };
  }

  return { type, text };
};

export const sanitizeBlocks = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map(sanitizeBlock)
    .filter(Boolean);
};

export const isRichTextBlockArray = (value) => Array.isArray(value) && sanitizeBlocks(value).length === value.length;

export const getRenderableBlocks = (value) => {
  if (Array.isArray(value)) {
    return sanitizeBlocks(value);
  }

  if (typeof value === "string" && value.trim()) {
    return [{ type: "paragraph", text: value }];
  }

  return [];
};

export const getPlainTextFromContent = (value) =>
  getRenderableBlocks(value)
    .map((block) => {
      if (block.type === "table") {
        return block.rows.map(row => row.map(cell => cell || "").join(" | ")).join("\n");
      }
      return normalizeText(block.text);
    })
    .join("\n")
    .trim();

export const hasRichTextContent = (value) => getPlainTextFromContent(value).length > 0;

export const areBlockContentsEqual = (left, right) =>
  JSON.stringify(getRenderableBlocks(left)) === JSON.stringify(getRenderableBlocks(right));

const createTextContent = (text = "") => {
  if (!text) return [];

  const parts = text.split("\n");
  const content = [];

  parts.forEach((part, index) => {
    if (part) {
      content.push({ type: "text", text: part });
    }

    if (index < parts.length - 1) {
      content.push({ type: "hardBreak" });
    }
  });

  return content;
};

const createTextBlockNode = (type, text, attrs) => {
  const content = createTextContent(text);

  return {
    type,
    ...(attrs ? { attrs } : {}),
    ...(content.length ? { content } : {}),
  };
};

const createTableCellNode = (cellText, isHeader, align) => {
  const content = createTextContent(cellText || "");
  const attrs = {};
  if (align && align !== 'left') attrs.textAlign = align;
  
  return {
    type: isHeader ? "tableHeader" : "tableCell",
    ...(Object.keys(attrs).length ? { attrs } : {}),
    ...(content.length ? { content } : {}),
  };
};

export const blocksToTiptapDoc = (value) => {
  const blocks = getRenderableBlocks(value);

  if (!blocks.length) {
    return {
      type: "doc",
      content: [{ type: "paragraph" }],
    };
  }

  const content = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "bullet" || block.type === "numbered") {
      const listType = block.type === "bullet" ? "bulletList" : "orderedList";
      const items = [];
      let pointer = index;

      while (pointer < blocks.length && blocks[pointer].type === block.type) {
        items.push({
          type: "listItem",
          content: [
            createTextBlockNode("paragraph", blocks[pointer].text),
          ],
        });
        pointer += 1;
      }

      content.push({
        type: listType,
        content: items,
      });

      index = pointer - 1;
      continue;
    }

    if (block.type === "heading") {
      content.push(createTextBlockNode("heading", block.text, { level: block.level }));
      continue;
    }

    if (block.type === "table") {
      const tableRows = (block.rows || []).map((row, rowIndex) => ({
        type: "tableRow",
        content: row.map((cell) => {
          const cellText = typeof cell === 'string' ? cell : (cell?.text || '');
          const cellAlign = typeof cell === 'object' ? cell?.align : null;
          return createTableCellNode(cellText, rowIndex === 0, cellAlign);
        }),
      }));

      content.push({
        type: "table",
        content: tableRows,
      });
      continue;
    }

    content.push(createTextBlockNode("paragraph", block.text));
  }

  return {
    type: "doc",
    content,
  };
};

const extractTextFromNode = (node) => {
  if (!node || typeof node !== "object") return "";

  if (node.type === "text") return normalizeText(node.text);
  if (node.type === "hardBreak") return "\n";

  return Array.isArray(node.content)
    ? node.content.map(extractTextFromNode).join("")
    : "";
};

export const editorDocToBlocks = (doc) => {
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
    return [];
  }

  const blocks = [];

  doc.content.forEach((node) => {
    if (!node || typeof node !== "object") return;

    if (node.type === "paragraph") {
      blocks.push({
        type: "paragraph",
        text: extractTextFromNode(node),
      });
      return;
    }

    if (node.type === "heading") {
      blocks.push({
        type: "heading",
        level: HEADING_LEVELS.has(Number(node.attrs?.level))
          ? Number(node.attrs.level)
          : 1,
        text: extractTextFromNode(node),
      });
      return;
    }

    if (node.type === "bulletList" || node.type === "orderedList") {
      const blockType = node.type === "bulletList" ? "bullet" : "numbered";

      (node.content || []).forEach((item) => {
        blocks.push({
          type: blockType,
          text: extractTextFromNode(item),
        });
      });
      return;
    }

    if (node.type === "table") {
      const rows = (node.content || []).map((rowNode) => {
        if (rowNode.type !== "tableRow") return [];
        return (rowNode.content || []).map((cellNode) => {
          const text = extractTextFromNode(cellNode);
          const align = cellNode.attrs?.textAlign;
          return align ? { text, align } : text;
        });
      });

      blocks.push({
        type: "table",
        rows,
      });
    }
  });

  return sanitizeBlocks(blocks).filter((block) => {
    if (block.type === "table") return true;
    return block.text && block.text.trim().length > 0;
  });
};
