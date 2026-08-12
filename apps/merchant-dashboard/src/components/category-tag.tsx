import { categoryStyle } from "@/lib/category";

export function CategoryTag({ category }: { category: string }) {
  const { emoji, tint } = categoryStyle(category);
  return (
    <div className="category-tag" style={{ background: tint }}>
      {emoji}
    </div>
  );
}
