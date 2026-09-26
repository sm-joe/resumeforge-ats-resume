const ALLOWED_TAGS = new Set([
  "A",
  "B",
  "BR",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "SPAN",
  "STRONG",
  "U",
  "UL",
]);

const ALLOWED_STYLE_PROPERTIES = new Set([
  "font-family",
  "font-size",
  "text-align",
]);

function sanitizeStyle(style: string) {
  return style
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separator = declaration.indexOf(":");

      if (separator === -1) return null;

      const property = declaration
        .slice(0, separator)
        .trim()
        .toLowerCase();
      const value = declaration
        .slice(separator + 1)
        .trim();

      if (
        !ALLOWED_STYLE_PROPERTIES.has(property) ||
        !value ||
        /[<>]/.test(value) ||
        /url\s*\(/i.test(value)
      ) {
        return null;
      }

      return `${property}: ${value}`;
    })
    .filter(
      (declaration): declaration is string =>
        declaration !== null,
    )
    .join("; ");
}

export function sanitizeRichTextHtml(
  value: string,
): string {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value
      .replace(/<\/?(script|style|iframe|object|embed)[^>]*>/gi, "")
      .replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    value,
    "text/html",
  );

  const cleanNode = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element = child as HTMLElement;

      if (!ALLOWED_TAGS.has(element.tagName)) {
        const fragment = document.createDocumentFragment();

        while (element.firstChild) {
          fragment.appendChild(element.firstChild);
        }

        element.replaceWith(fragment);
        cleanNode(node);
        continue;
      }

      for (const attribute of Array.from(
        element.attributes,
      )) {
        const name = attribute.name.toLowerCase();

        if (name === "style") {
          const style = sanitizeStyle(
            attribute.value,
          );

          if (style) {
            element.setAttribute("style", style);
          } else {
            element.removeAttribute("style");
          }
          continue;
        }

        if (element.tagName === "A" && name === "href") {
          const href = attribute.value.trim();

          if (
            /^(https?:|mailto:|tel:)/i.test(href)
          ) {
            element.setAttribute("href", href);
            element.setAttribute(
              "target",
              "_blank",
            );
            element.setAttribute(
              "rel",
              "noreferrer noopener",
            );
          } else {
            element.removeAttribute("href");
          }
          continue;
        }

        element.removeAttribute(attribute.name);
      }

      cleanNode(element);
    }
  };

  cleanNode(document.body);

  return document.body.innerHTML;
}

export function plainTextFromRichText(
  value: string,
): string {
  if (!value) return "";

  if (typeof window === "undefined") {
    return value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    value,
    "text/html",
  );

  return (document.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextToRichTextHtml(
  value: string,
): string {
  if (!value) return "";

  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return escaped
    .split(/\r?\n/)
    .map((line) => line || "<br />")
    .join("<br />");
}
