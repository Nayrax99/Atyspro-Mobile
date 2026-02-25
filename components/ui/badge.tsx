import { Text, View } from "react-native";

type Variant =
  | "urgent"
  | "needs_review"
  | "incomplete"
  | "complete"
  | "neutral";

export function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: Variant;
}) {
  const colors = {
    urgent: { bg: "#ffe5e5", text: "#c62828" },
    needs_review: { bg: "#fff3e0", text: "#ef6c00" },
    incomplete: { bg: "#eeeeee", text: "#616161" },
    complete: { bg: "#e8f5e9", text: "#2e7d32" },
    neutral: { bg: "#e3f2fd", text: "#1565c0" },
  };

  const style = colors[variant];

  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: style.text, fontSize: 12, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}