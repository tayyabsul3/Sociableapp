import { View, Text, Button, StatusBar } from "react-native";
import React from "react";
import { Link, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import Loading from "@/components/Loading";

export default function page() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Loading />
    </View>
  );
}
