interface CategoryStyle {
  emoji: string;
  tint: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  cerveja: { emoji: "🍺", tint: "#8a5a12" },
  vinho: { emoji: "🍷", tint: "#6b1f3d" },
  sem_alcool: { emoji: "💧", tint: "#1b5c91" },
  destilado: { emoji: "🥃", tint: "#5b2c6f" },
  geral: { emoji: "🛒", tint: "#3a3f47" },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.geral!;
}
