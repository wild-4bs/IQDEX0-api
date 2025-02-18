import { v2 as _cloudinary } from "cloudinary";

const cloudinary = () => {
  _cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return _cloudinary;
};

export const uploadToCloudinary = async (filePath: any, folder: any) => {
  const response = await cloudinary().uploader.upload(filePath, {
    folder: folder,
    public_id: `image-${Date.now()}`,
  });
  return response;
};

export const uploadStreamCloudinary = async (data: any, folder: any) => {
  const response = await new Promise<void>((resolve, reject) => {
    const uploadStream = cloudinary().uploader.upload_stream(
      { folder: folder },
      (err, result: any) => {
        if (err) {
          return reject(err);
        }
        if (result) {
          resolve(result);
        }
      }
    );
    return uploadStream.end(data);
  });
  return response;
};

export const uploadPdfFile = async (filePath: any, folder: any) => {
  const response = await cloudinary().uploader.upload(filePath, {
    resource_type: "raw",
    folder: folder,
  });
  return response;
};
