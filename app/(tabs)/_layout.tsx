import { Tabs } from "expo-router";
import { Text } from "react-native";

const TAB_ICON_SIZE = 19;

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: "AtysPro",
        tabBarIconStyle: { justifyContent: "center", alignItems: "center" },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dialer"
        options={{
          title: "Clavier",
          tabBarIcon: () => (
            <Text style={{ fontSize: TAB_ICON_SIZE, textAlign: "center" }}>☎️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Leads",
          tabBarIcon: () => (
            <Text style={{ fontSize: TAB_ICON_SIZE, textAlign: "center" }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: () => (
            <Text style={{ fontSize: TAB_ICON_SIZE, textAlign: "center" }}>⚙️</Text>
          ),
        }}
      />
    </Tabs>
  );
}