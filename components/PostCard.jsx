import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets";
import { downloadFile, getSupabaseFileUrl } from "../services/ImageService";
import { Image } from "expo-image";
import RenderHTML from "react-native-render-html";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./Loading";

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  canDelete = false,
  onEdit = () => {},
  onDelete = () => {},
}) => {
  const [likes, setLikes] = useState([]);
  const liked = likes?.filter((like) => like.userId == currentUser?.id)[0]
    ? true
    : false;

  const shadowStyles = hasShadow
    ? {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 2,
      }
    : {};
  const textStyle = {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  };

  const tagsStyles = {
    div: textStyle,
    p: textStyle,
    ol: textStyle,
    h1: {
      color: theme.colors.dark,
    },
    h4: {
      color: theme.colors.dark,
    },
  };
  const createdAt = moment(item?.created_at).format("MMM D");

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };
  const [loading, setLoading] = useState(false);
  const onLike = async () => {
    if (liked) {
      let updatedLikes = likes?.filter(
        (like) => like.userId !== currentUser?.id
      );
      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);
      console.log("removed like: ", res);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      // create like
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      console.log("added like: ", res);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    }
  };
  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(item?.file));
      setLoading(false);
      content.url = url;
    }
    Share.share(content);
    // Alert.alert("Post", "Share post on your preferred platform");
  };
  const handleDelete = async (item) => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          console.log("modal canceled");
        },
      },
      {
        text: "Delete Post",
        style: "destructive",
        onPress: () => onDelete(item),
      },
    ]);
  };

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);
  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.3)}
            url={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="threeDotsHorizontal" size={hp(3.4)} />
          </TouchableOpacity>
        )}
        {canDelete && currentUser.id == item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.5)} color={theme.colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Icon name="delete" size={hp(2.5)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHTML
              contentWidth={wp(100)}
              source={{ html: item?.body }}
              tagsStyles={tagsStyles}
            />
          )}
        </View>
        {/* post image */}
        {item?.file && item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
          />
        )}
        {/* // post video */}
        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={{ uri: getSupabaseFileUrl(item?.file) }}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}
        {/* // like, comment & share */}
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              <Icon
                name="heart"
                size={24}
                fill={liked ? theme.colors.rose : "transparent"}
                color={liked ? theme.colors.rose : theme.colors.textLight}
              />
            </TouchableOpacity>
            <Text style={styles.count}>{likes?.length}</Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>{item?.comments[0]?.count}</Text>
          </View>
          <View style={styles.footerButton}>
            {loading ? (
              <Loading />
            ) : (
              <TouchableOpacity onPress={onShare}>
                <Icon name="share" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
            {/* <Text style={styles.count}>{likes?.length}</Text> */}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
    // marginBottom: 10,
  },
});
