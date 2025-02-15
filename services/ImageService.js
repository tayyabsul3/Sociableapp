import * as FileSystem from "expo-file-system";
import { supabase } from "../libs/supabase";
import { decode } from "base64-arraybuffer";

export const getUserImageSrc = (src) => {
  if (src)
    return {
      uri: getSupabaseFileUrl(src),
    };
  return require("../assets/images/splashicon.png");
};
export const downloadFile = async (url) => {
  try {
    const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
    return uri;
  } catch (error) {
    console.log("downloadFile error: ", error);
    return null;
  }
};

export const getLocalFilePath = (filePath) => {
  let fileName = filePath.split("/").pop();
  return `${FileSystem.documentDirectory}${fileName}`;
};
export const getSupabaseFileUrl = (filePath) => {
  if (filePath) {
    return `https://plrhlsmmhmuutumibwez.supabase.co/storage/v1/object/public/pictures/${filePath}`;
  }
  return null;
};
export const uploadFile = async (folderName, fileUrl, isImage = true) => {
  try {
    let fileName = getFilePath(folderName, isImage);

    const fileBase64 = await FileSystem.readAsStringAsync(fileUrl, {
      encoding: FileSystem.EncodingType.Base64,
    });
    let imageData = decode(fileBase64); // array buffer
    let { data, error } = await supabase.storage
      .from("pictures")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/*" : "video/*",
      });

    if (error) {
      console.log("file upload error: ", error);
      return { success: false, msg: "Could not upload media" };
    }

    // console.log("Upload successful!", data);
    return { success: true, data: data.path };
  } catch (error) {
    console.log("FILE upload error: ", error);
    return { success: false, msg: "Could not upload media" };
  }
};

export const getFilePath = (folderName, isImage) => {
  return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};
