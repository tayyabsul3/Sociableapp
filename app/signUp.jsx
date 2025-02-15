import { Alert, StatusBar, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import Input from "@/components/Input";

import ScreenWrapper from "@/components/ScreenWrapper";
import Icon from "../assets/index";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Button from "../components/Button";
import { theme } from "../constants/theme";
import { supabase } from "../libs/supabase";
const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const usernameRef = useRef("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!emailRef.current || !passwordRef.current || !usernameRef.current) {
      Alert.alert("Error", "Please fill all the fields");
      return;
    }

    let name = usernameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          email,
        },
      },
    });

    console.log("Session:", session);
    console.log("error:", error);

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <ScreenWrapper bg="white">
      <StatusBar barStyle={"dark-content"} />
      <View style={styles.container}>
        <BackButton router={router} />
        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get started </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please Sign up to continue
          </Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            onChangeText={(value) => (usernameRef.current = value)} // Replace with your logic
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)} // Replace with your logic
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder="Enter your password"
            onChangeText={(value) => (passwordRef.current = value)} // Replace with your logic
          />

          {/* <Text style={styles.forgotPassword}>Forgot Password?</Text> */}
          <Button title="Sign up" loading={loading} onPress={onSubmit} />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have and account ?</Text>
          <Text
            onPress={() => {
              router.push("login");
            }}
            style={[
              styles.footerText,
              {
                color: theme.colors.primaryDark,
                fontWeight: theme.fonts.semibold,
              },
            ]}
          >
            Login
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45, // Replace `=>` with a valid value, e.g., 10
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});
