const cloudinary = require('../config/cloudinary');

exports.uploadImageFromBuffer = (fileBuffer, folder, customPublicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = { folder };
    if (customPublicId) {
      uploadOptions.public_id = customPublicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    // Write the buffer to the stream and end it
    uploadStream.end(fileBuffer);
  });
};

exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image with publicId: ${publicId}`, error);
  }
};
