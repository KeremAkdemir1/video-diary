import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { backgroundColor: "#1e90ff",margin:20,borderRadius:10 },
                tabBarActiveTintColor: "#fff",
                tabBarInactiveTintColor: "#ccc",
                headerShown: false,
                title:''
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: "Videos",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="image-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="videoSelect/index"
                options={{
                    tabBarLabel: "Crop Video",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="crop-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
