import { View, Text, Button, StatusBar, LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "@/libs/supabase";
import { getUserData } from "../services/userService";
LogBox.ignoreLogs[
  ("Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
  "Warning: ReferenceError",
  "Warning: ReferenceError")
];
function _layout() {
  return (
    <AuthProvider>
      <StatusBar barStyle={"dark-content"} />
      <MainLayout />
    </AuthProvider>
  );
}

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("Auth sates changed", session?.user?.id);
      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        // console.log("Auth", session?.user);
        router.push("home");
      } else {
        setAuth(null);
        // console.log("Auth", session?.user);

        router.push("welcome");
      }
    });
  }, []);
  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    console.log(res);
    if (res.success) setUserData({ ...res.data, email });
  };
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen
        name="(main)/postDetails"
        options={{ presentation: "modal" }}
      /> */}
    </Stack>
  );
};

export default _layout;
