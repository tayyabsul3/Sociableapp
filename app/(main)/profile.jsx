import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { supabase } from "../../libs/supabase";
import { FlatList } from "react-native";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { fetchPosts } from "../../services/postService";
let limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [hasMore, sethasMore] = useState(true);
  const router = useRouter();
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(error.message);
    }
  };
  const handleLogout = async () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          console.log("modal canceled");
        },
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => onLogout(),
      },
    ]);
  };

  const getPosts = async () => {
    // call the api here
    if (!hasMore) return null;
    limit += 10;
    console.log("limite now: " + limit);
    let res = await fetchPosts(limit, user.id);
    // console.log(res.data[0].user);
    if (res.success) {
      if (res.data.length < 4) sethasMore(false);

      if (posts.length === res.data.length) sethasMore(false);
      setPosts(res.data);
    }
  };
  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader user={user} router={router} handleLogout={handleLogout} />
        }
        ListHeaderComponentStyle={{
          marginBottom: 20,
        }}
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
            <View style={{ marginHorizontal: 30 }}>
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
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingHorizontal: wp(4),
      }}
    >
      <View>
        <Header title="Profile" showBackButton={true} mb={30} />
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Icon name={"logout"} color={theme.colors.rose} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              url={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("editProfile")}
            >
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{user && user.name}</Text>
            <Text style={styles.infoText}>{user && user.address}</Text>
          </View>
          <View style={{ gap: 4 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user && user.email}</Text>
            </View>
            {user && user.phone && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{user && user.phone}</Text>
              </View>
            )}
            {user && user.bio && (
              <Text style={styles.infoText}>{user.bio}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  logout: {
    position: "absolute",
    right: 0,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  avatarContainer: {
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 8,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#free2e2",
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});
