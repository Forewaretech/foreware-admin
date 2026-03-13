import axios from "axios";

const storageBaseUrl = `${import.meta.env.VITE_FOREWARE_API_URL}/storage`;

export const uploadToS3 = async (file: File, folder = "blog") => {
  // 1. Get Presigned URL from your API
  const { data } = await axios.put(`${storageBaseUrl}/presigned-url`, {
    fileName: file.name,
    fileType: file.type,
    folder,
  });

  const { uploadUrl, fileUrl } = data;

  // 2. Upload file directly to S3
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });

  return fileUrl; // This is the permanent link
};

export const deleteFromS3 = async (url: string) => {
  await axios.delete(`${storageBaseUrl}/presigned-url/?url=${url}`);
};
