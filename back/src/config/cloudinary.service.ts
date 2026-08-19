import { Injectable } from "@nestjs/common"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"
import "./cloudinary.config" // Ensure config is loaded

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "lossietediaz" },
        (error, result) => {
          if (error) return reject(error)
          if (!result) return reject(new Error("Cloudinary upload failed with empty result"))
          resolve(result)
        },
      )

      if (file.buffer) {
        Readable.from(file.buffer).pipe(uploadStream)
      } else if (file.path) {
        cloudinary.uploader.upload(file.path, { folder: "lossietediaz" })
          .then((res) => resolve(res))
          .catch((err) => reject(err))
      } else {
        reject(new Error("No valid file content provided for Cloudinary upload"))
      }
    })
  }
}
