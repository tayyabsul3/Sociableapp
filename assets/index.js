import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Home from "../assets/icons/Home";
import Mail from "../assets/icons/Mail";
import Lock from "../assets/icons/Lock";
import User from "../assets/icons/User";
import Heart from "../assets/icons/Heart";
import Plus from "../assets/icons/Plus";
import Search from "../assets/icons/Search";
import Location from "../assets/icons/Location";
import Call from "../assets/icons/Call";
import Camera from "../assets/icons/Camera";
import Edit from "../assets/icons/Edit";
import ArrowLeft from "../assets/icons/ArrowLeft";
import ThreeDotsCircle from "../assets/icons/ThreeDotsCircle";
import ThreeDotsHorizontal from "../assets/icons/ThreeDotsHorizontal";
import Comment from "../assets/icons/Comment";
import Share from "../assets/icons/Share";
import Send from "../assets/icons/Send";
import Delete from "../assets/icons/Delete";
import Logout from "../assets/icons/logout";
import Image from "../assets/icons/Image";
import Video from "../assets/icons/Video";
import { theme } from "../constants/theme";
const icons = {
  home: Home,
  mail: Mail,
  lock: Lock,
  user: User,
  heart: Heart,
  plus: Plus,
  search: Search,
  location: Location,
  call: Call,
  camera: Camera,
  edit: Edit,
  arrowLeft: ArrowLeft,
  threeDotsCircle: ThreeDotsCircle,
  threeDotsHorizontal: ThreeDotsHorizontal,
  comment: Comment,
  share: Share,
  send: Send,
  delete: Delete,
  logout: Logout,
  image: Image,
  video: Video,
};

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.9}
      color={theme.colors.textLight}
      {...props}
    />
  );
};

export default Icon;

const styles = StyleSheet.create({});
