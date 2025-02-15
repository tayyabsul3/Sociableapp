import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createPostComment,
  fetchPostDetails,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Loading from "../../components/Loading";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "../../components/PostCard";
import Icon from "../../assets";
import Input from "../../components/Input";

const PostDetails = () => {
  const { postId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const commentRef = useRef("");

  const [startLoading, setstartLoading] = useState(true);

  useEffect(() => {
    getPostDetails();
  }, []);

  const getPostDetails = async () => {
    let res = await fetchPostDetails(postId);
    if (res.success) setPost(res.data);
    setstartLoading(false);
  };

  const onNewComment = async () => {
    //code here

    let data = {
      userId: user?.id,
      postId: postId,
      text: commentRef.current,
    };
    setLoading(true);
    let res = await createPostComment(data);
    setLoading(false);
    if (res.success) {
      //send notification later
      inputRef?.current.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={post}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
        />
        {/* comment input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={{
              height: hp(7.2),
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 0.4,
              borderColor: theme.colors.text,
              borderRadius: theme.radius.xxl,
              borderCurve: "continuous",
              paddingHorizontal: 18,
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
            onChangeText={(value) => (commentRef.current = value)}
            ref={inputRef}
            placeholder="Type comment..."
          />

          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
});
