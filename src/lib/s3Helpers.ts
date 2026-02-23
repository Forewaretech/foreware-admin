import axios from "axios";

export const uploadToS3 = async (file: File, folder = "blog") => {
  console.log("FILE: ", file);
  // 1. Get Presigned URL from your API
  const { data } = await axios.put(
    `${import.meta.env.VITE_FOREWARE_API_URL}/storage/presigned-url`,
    {
      fileName: file.name,
      fileType: file.type,
      folder,
    },
  );

  const { uploadUrl, fileUrl } = data;

  // 2. Upload file directly to S3
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });

  return fileUrl; // This is the permanent link
};
