import { StyleSheet, Text, View } from "react-native";
import { categoryStyle, radius } from "@/lib/theme";

interface ProductImageProps {
  category: string;
  size?: number;
}

// No real product photos yet — a tinted, category-coded tile with an emoji
// reads far better than a blank box and needs no image pipeline/Storage upload.
export function ProductImage({ category, size = 56 }: ProductImageProps) {
  const { emoji, tint } = categoryStyle(category);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, backgroundColor: tint, borderRadius: size >= 56 ? radius.md : radius.sm },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
