const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "portafolio-bigdata",
        resource_type: "auto", // detecta imagen / pdf / video / etc.
        filename_override: filename,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

function deleteAsset(publicId, resourceType = "auto") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(() => {
    // si falla el borrado remoto no bloqueamos el borrado en la base de datos
  });
}

module.exports = { uploadBuffer, deleteAsset };
