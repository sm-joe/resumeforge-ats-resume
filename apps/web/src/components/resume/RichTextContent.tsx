import { sanitizeRichTextHtml } from "@/lib/richText";

interface RichTextContentProps {
  value: string;
  className?: string;
}

export function RichTextContent({
  value,
  className,
}: RichTextContentProps) {
  if (!value) return null;

  const isRichText = /<\/?[a-z][\s\S]*>/i.test(value);

  if (!isRichText) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: sanitizeRichTextHtml(value),
      }}
    />
  );
}
