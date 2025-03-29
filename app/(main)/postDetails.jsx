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
  removeComment,
  removePost,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Loading from "../../components/Loading";
import { useAuth } from "../../contexts/AuthContext";
import PostCard from "../../components/PostCard";
import Icon from "../../assets";
import Input from "../../components/Input";
import CommentItem from "../../components/CommentItem";
import { supabase } from "../../libs/supabase";
import { getUserData } from "../../services/userService";
import { createNotification } from "../../services/notificationService";

const PostDetails = () => {
  const { postId, commentId } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const commentRef = useRef("");

  const [startLoading, setstartLoading] = useState(true);

  const handleNewComment = async (payload) => {
    // console.log("got new comment", payload.new);
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prevPost) => ({
        ...prevPost,
        comments: [newComment, ...prevPost.comments],
      }));
    }
  };
  useEffect(() => {
    let postChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handleNewComment
      )
      .subscribe();
    getPostDetails();

    return () => {
      supabase.removeChannel(postChannel);
    };
  }, []);
  const getPostDetails = async () => {
    let res = await fetchPostDetails(postId);
    if (res.success) setPost(res.data);
    setstartLoading(false);
  };
  // console.log(postId);
  const onNewComment = async () => {
    //code here
    if (!commentRef.current) return null;
    let data = {
      userId: user?.id,
      postId: postId,
      text: commentRef.current,
    };
    // console.log("comment", data);
    setLoading(true);
    let res = await createPostComment(data);
    setLoading(false);
    if (res.success) {
      if (user.id != post.userId) {
        // send notification
        let notify = {
          senderId: user.id,
          receiverId: post.userId,
          title: "commented on your post",
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
        };
        console.log("notify", notify);
        createNotification(notify);
      }
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
  // console.log(post.comments);
  // console.log(post?.comments.length);
  const onDeleteComment = async (comment) => {
    console.log("deleting comment: ", comment.text);
    let res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        let updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments.filter(
          (c) => c.id != comment.id
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };
  const onPostDelete = async (item) => {
    console.log("deleting post: ", item);
    let res = await removePost(item?.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Post", res.msg);
    }
  };
  const onPostEdit = async (item) => {
    router.back();
    router.push({ pathname: "newpost", params: { ...item } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post, comments: [{ count: post?.comments.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          canDelete={true}
          onDelete={onPostDelete}
          onEdit={onPostEdit}
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
        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments?.map((comment) => (
            <CommentItem
              key={comment?.id?.toString()}
              item={comment}
              onDelete={onDeleteComment}
              highlight={commentId == comment.id}
              canDelete={user?.id === comment?.userId || user.id == post.userId}
            />
          ))}

          {post?.comments?.length === 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Be the first to comment!
            </Text>
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
