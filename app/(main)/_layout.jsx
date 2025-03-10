import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="postDetails"  options={{ presentation: "modal" }} />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
