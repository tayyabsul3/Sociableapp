import {
  StyleSheet,
  Button,
  Text,
  View,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import ScreenWrapper from "../../components/ScreenWrapper";
import { supabase } from "../../libs/supabase";
import { theme } from "../../constants/theme";
import Icon from "../../assets/index";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPosts } from "../../services/postService";
import { getUserData } from "../../services/userService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

var limit = 0;
const Home = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasMore, sethasMore] = useState(true);

  const handlePostEvent = async (payload) => {
    // console.log("got new post", payload.new);

    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }

    if (payload.eventType === "DELETE" && payload.old.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.filter(
          (post) => post.id !== payload.old.id
        );
        return updatedPosts;
      });
    }

    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
          if (post.id === payload.new.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };
  console.log("postcomment", posts[0]?.comments);
  const handleNewCommentEvent = async (payload) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      posts.map((item) => {
        if (item.id == newComment.postId) {
          console.log("got new comment", item.comments);
        }
      });
      setPosts((prevPost) => {
        let cloned = [...prevPost];
        cloned = cloned.map((item) => {
          if (item.id == newComment.postId) {
            return {
              ...item,
              comments: [{ count: item.comments[0].count + 1 }],
            };
          }
          return item;
        });
        return cloned;
      });
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        handleNewCommentEvent
      )
      .subscribe();
    // getPostDetails();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getPosts = async () => {
    
    // call the api here
    if (!hasMore) return null;
    limit += 4;
    console.log("limite now: " + limit);
    let res = await fetchPosts(limit);
    // console.log(res.data[0].user);
    if (res.success) {
      if (posts.length === res.data.length) sethasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg={"white"}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Network</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("notifications")}>
              <Icon
                name="heart"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("newpost")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar
                url={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
          )}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length !== 0 ? 30 : 100 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
          onEndReachedThreshold={0}
          onEndReached={() => {
            getPosts();
            console.log("reached end");
          }}
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: wp(4)
  },
  header: {
    // backgroundColor: "red",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
  },
});
