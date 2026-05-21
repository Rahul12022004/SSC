import "@/styles/richTextBlocks.css";
import { getRenderableBlocks } from "@/common/utils/richTextBlocks";

function renderTextWithBreaks(text) {
  const parts = String(text || "").split("\n");

  return parts.map((part, index) => (
    <span key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 && <br />}
    </span>
  ));
}

export function RichTextBlockRenderer({ content, className = "" }) {
  const blocks = getRenderableBlocks(content);

  if (!blocks.length) return null;

  const renderedBlocks = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];

    if (block.type === "bullet" || block.type === "numbered") {
      const ListTag = block.type === "bullet" ? "ul" : "ol";
      const listBlocks = [];
      let pointer = index;

      while (pointer < blocks.length && blocks[pointer].type === block.type) {
        listBlocks.push(blocks[pointer]);
        pointer += 1;
      }

      renderedBlocks.push(
        <ListTag
          key={`${block.type}-${index}`}
          className={`rich-block-list rich-block-list-${block.type}`}
        >
          {listBlocks.map((item, itemIndex) => (
            <li key={`${item.type}-${index}-${itemIndex}`}>
              {renderTextWithBreaks(item.text)}
            </li>
          ))}
        </ListTag>,
      );

      index = pointer - 1;
      continue;
    }

    if (block.type === "heading") {
      const HeadingTag = `h${block.level}`;

      renderedBlocks.push(
        <HeadingTag
          key={`heading-${block.level}-${index}`}
          className={`rich-block-heading rich-block-heading-${block.level}`}
        >
          {renderTextWithBreaks(block.text)}
        </HeadingTag>,
      );
      continue;
    }

    if (block.type === "table") {
      renderedBlocks.push(
        <table key={`table-${index}`} className="rich-block-table">
          <tbody>
            {(block.rows || []).map((row, rowIndex) => (
              <tr key={`row-${index}-${rowIndex}`}>
                {row.map((cell, cellIndex) => {
                  const CellTag = rowIndex === 0 ? "th" : "td";
                  const cellText = typeof cell === 'string' ? cell : (cell?.text || '');
                  const cellAlign = typeof cell === 'object' ? cell?.align : null;
                  return (
                    <CellTag 
                      key={`cell-${index}-${rowIndex}-${cellIndex}`}
                      style={cellAlign ? { textAlign: cellAlign } : undefined}
                    >
                      {renderTextWithBreaks(cellText)}
                    </CellTag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    renderedBlocks.push(
      <p key={`paragraph-${index}`} className="rich-block-paragraph">
        {renderTextWithBreaks(block.text)}
      </p>,
    );
  }

  return (
    <div className={`rich-block-renderer ${className}`.trim()}>
      {renderedBlocks}
    </div>
  );
}

export default RichTextBlockRenderer;
