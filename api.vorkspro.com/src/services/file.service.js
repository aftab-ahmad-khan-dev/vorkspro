// // In services/file.service.js

// import fs from 'fs';
// import multer from 'multer';
// import sharp from 'sharp';
// import path from 'path';
// import aws_sdk from 'aws-sdk';
// import { randomStringGenerator } from './utilities.service.js';

// aws_sdk.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });
// const s3Config = new aws_sdk.S3();

// const fileDestination = 'public/';
// const USE_AWS = false;

// const kycFields = [
//     { name: 'civilIdFront', maxCount: 1 },
//     { name: 'civilIdBack', maxCount: 1 },
//     { name: 'passport', maxCount: 1 },
//     { name: 'addressProof', maxCount: 1 },
//     { name: 'bankStatement', maxCount: 1 },
// ];

// export const kycUploadRoute = multer({
//     storage: multer.memoryStorage(),
//     fileFilter: (req, file, cb) => {
//         const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//         if (!validImageTypes.includes(file.mimetype)) {
//             console.error(`kycUploadRoute: Invalid MIME type for ${file.fieldname}: ${file.mimetype}`);
//             return cb(new Error(`Invalid file type for ${file.fieldname}. Only JPEG, PNG, or GIF allowed.`));
//         }
//         cb(null, true);
//     },
//     limits: { fileSize: 2 * 1024 * 1024 },
// }).fields(kycFields);

// // Existing Multer configurations (unchanged)
// const upload = multer({ storage: multer.memoryStorage() });
// export const multerSingleUploadRoute = multer({ dest: fileDestination }).single('file');
// export const multerMultipleUploadRoute = multer({ dest: fileDestination }).array('files');
// const awsSingleUploadRoute = upload.single('file');
// const awsMultiUploadRoute = upload.single('files');
// const singleUploadRoute = USE_AWS ? awsSingleUploadRoute : multerSingleUploadRoute;
// const multiUploadRoute = USE_AWS ? awsMultiUploadRoute : multerMultipleUploadRoute;

// function fileNameGenerator(file) {
//     const dateTimeStamp = Date.now();
//     const randomString = Math.random().toString(36).substring(2, 7);
//     const fileExtension = file.originalname.split('.').pop();
//     return `file-${dateTimeStamp}-${randomString}.${fileExtension}`;
// }

// function isPhoto(fileName) {
//     const fileExtension = path.extname(fileName).toLowerCase();
//     const photoExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
//     const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv'];
//     return photoExtensions.includes(fileExtension) || !videoExtensions.includes(fileExtension) ? null : fileExtension;
// }

// export function fileRemover(fileName) {
//     try {
//         const file = path.join(fileDestination, fileName);
//         if (fs.existsSync(file)) {
//             fs.unlinkSync(file);
//             return true;
//         }
//     } catch {
//         return false;
//     }
//     return false;
// }

// // AWS File Functions (unchanged)
// async function uploadSingleAWSFile(file) {
//     const fileName = fileNameGenerator(file);
//     const params = {
//         Bucket: process.env.AWS_BUCKET,
//         Key: fileName,
//         Body: file.buffer,
//     };
//     return new Promise((resolve, reject) => {
//         s3Config.upload(params, (err, data) => {
//             if (err) return reject(`Error uploading file: ${err.message}`);
//             resolve(data.Key);
//         });
//     });
// }

// async function uploadMultipleAWSFiles(files) {
//     const promises = files.map((file) => uploadSingleAWSFile(file));
//     return Promise.all(promises);
// }

// async function removeAWSFile(fileName) {
//     const params = { Bucket: process.env.AWS_BUCKET, Key: fileName };
//     await s3Config.deleteObject(params).promise();
// }

// // Updated multerFileUploader
// async function multerFileUploader(file, isCompress = false, size = 300) {
//     if (!fs.existsSync(fileDestination)) fs.mkdirSync(fileDestination, { recursive: true });
//     if (!file || file.size === 0) {
//         console.error(`multerFileUploader: No file or empty file provided for ${file?.fieldname || 'unknown'}`);
//         return false;
//     }

//     const fileName = fileNameGenerator(file);
//     const filePath = path.join(fileDestination, fileName);
//     console.log(
//         `multerFileUploader: Processing file - Field: ${file.fieldname}, Name: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size}, Destination: ${filePath}`
//     );

//     try {
//         // Skip compression for civilIdFront to test if sharp is the issue
//         const shouldCompress = isCompress && file.fieldname !== 'civilIdFront';
//         if (file.mimetype.startsWith('image/') && shouldCompress) {
//             console.log(`multerFileUploader: Compressing image to ${size}px for ${file.fieldname}`);
//             const transformedFile = await sharp(file.buffer)
//                 .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
//                 .toBuffer();
//             fs.writeFileSync(filePath, transformedFile);
//             console.log(`multerFileUploader: Compressed image written to ${filePath}`);
//         } else {
//             console.log(`multerFileUploader: Writing file without compression for ${file.fieldname}`);
//             fs.writeFileSync(filePath, file.buffer);
//             console.log(`multerFileUploader: File written to ${filePath}`);
//         }
//         return fileName;
//     } catch (error) {
//         console.error(
//             `multerFileUploader: Error processing file ${file.fieldname} (${file.originalname}):`,
//             error.message,
//             error.stack
//         );
//         return false;
//     }
// }

// export async function singleFileUploadManager(file, isCompress, size) {
//     return file ? await multerFileUploader(file, isCompress, size) : null;
// }

// export async function multipleFilesUploadManager(files, isCompress, size) {
//     if (!files || !files.length) return null;
//     const uploadPromises = files.map((file) => multerFileUploader(file, isCompress, size));
//     const results = await Promise.all(uploadPromises);
//     return results.includes(false) ? null : results;
// }

// async function uploadASingleFile(file, isCompress, size) {
//     try {
//         console.log(
//             `uploadASingleFile: Starting upload - Field: ${file.fieldname}, Name: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size}`
//         );
//         const result = USE_AWS
//             ? await uploadSingleAWSFile(file)
//             : await singleFileUploadManager(file, isCompress, size);
//         if (!result) {
//             console.error(`uploadASingleFile: Failed to upload ${file.fieldname} (${file.originalname})`);
//         } else {
//             console.log(`uploadASingleFile: Successfully uploaded ${file.fieldname} as ${result}`);
//         }
//         return result;
//     } catch (error) {
//         console.error(
//             `uploadASingleFile: Error uploading ${file.fieldname} (${file.originalname}):`,
//             error.message,
//             error.stack
//         );
//         return null; // Return null instead of throwing to match controller expectation
//     }
// }

// async function uploadMultipleFiles(files, isCompress, size) {
//     try {
//         return USE_AWS ? await uploadMultipleAWSFiles(files) : await multipleFilesUploadManager(files, isCompress, size);
//     } catch (error) {
//         throw error;
//     }
// }

// async function removeFile(fileName) {
//     return USE_AWS ? await removeAWSFile(fileName) : fileRemover(fileName);
// }

// async function downloadImageToFile(imageUrl) {
//     return new Promise((resolve, reject) => {
//         https.get(imageUrl, (response) => {
//             if (response.statusCode !== 200) {
//                 return reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
//             }
//             const chunks = [];
//             response.on('data', (chunk) => chunks.push(chunk));
//             response.on('end', () => {
//                 const buffer = Buffer.concat(chunks);
//                 resolve({
//                     originalname: `${randomStringGenerator(6, 'alphabetic', false)}_image.jpg`,
//                     mimetype: response.headers['content-type'],
//                     buffer,
//                 });
//             });
//         }).on('error', (err) => {
//             reject(new Error('Could not download image'));
//         });
//     });
// }

// export {
//     fileDestination,
//     singleUploadRoute,
//     multiUploadRoute,
//     uploadASingleFile,
//     uploadMultipleFiles,
//     removeFile,
//     downloadImageToFile,
//     fileNameGenerator,
//     isPhoto,
// };

// !  original code below ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════===================
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import https from "https";
import aws_sdk from "aws-sdk";
import { randomStringGenerator } from "./utilities.service.js";

// AWS Configuration
aws_sdk.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const s3Config = new aws_sdk.S3();

// Constants
const fileDestination = "public/";
const USE_AWS = false;

// Multer Configuration
const upload = multer({ storage: multer.memoryStorage() });
export const multerSingleUploadRoute = multer({ dest: fileDestination }).single(
  "file"
);
export const multerMultipleUploadRoute = multer({ dest: fileDestination }).array(
  "files"
);
const awsSingleUploadRoute = upload.single("file");
const awsMultiUploadRoute = upload.single("files");

const singleUploadRoute = USE_AWS ? awsSingleUploadRoute : multerSingleUploadRoute;
const multiUploadRoute = USE_AWS ? awsMultiUploadRoute : multerMultipleUploadRoute;


export const multerFieldsUploadRoute = multer({ dest: fileDestination }).fields([
  { name: "civilIdFront", maxCount: 1 },
  { name: "civilIdBack", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "addressProof", maxCount: 1 }
]);

const awsFieldsUploadRoute = upload.fields([
  { name: "civilIdFront", maxCount: 1 },
  { name: "civilIdBack", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "addressProof", maxCount: 1 }
]);

export const fieldsUploadRoute = USE_AWS ? awsFieldsUploadRoute : multerFieldsUploadRoute;
function fileNameGenerator(file) {
  const dateTimeStamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 7);
  const fileExtension = file.originalname?.split(".").pop();
  return `file-${dateTimeStamp}-${randomString}.${fileExtension}`;
}

function isPhoto(fileName) {
  const fileExtension = path.extname(fileName).toLowerCase();
  const photoExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".mkv"];
  return photoExtensions.includes(fileExtension) ||
    !videoExtensions.includes(fileExtension)
    ? null
    : fileExtension;
}

export function fileRemover(fileName) {
  try {
    const file = path.join(fileDestination, fileName);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// AWS File Functions
async function uploadSingleAWSFile(file) {
  const fileName = fileNameGenerator(file);
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: file.buffer,
  };

  return new Promise((resolve, reject) => {
    s3Config.upload(params, (err, data) => {
      if (err) return reject(`Error uploading file: ${err.message}`);
      resolve(data.Key);
    });
  });
}

async function uploadMultipleAWSFiles(files) {
  const promises = files.map((file) => uploadSingleAWSFile(file));
  return Promise.all(promises);
}

async function removeAWSFile(fileName) {
  const params = { Bucket: process.env.AWS_BUCKET, Key: fileName };
  await s3Config.deleteObject(params).promise();
}

// Local File Functions
async function multerFileUploader(file, isCompress = false, size = 300) {
  if (!fs.existsSync(fileDestination))
    fs.mkdirSync(fileDestination, { recursive: true });
  if (!file) return false;

  const fileName = fileNameGenerator(file);
  console.log("fileName: ", fileName);
  const filePath = path.join(fileDestination, fileName);
  console.log("filePath: ", filePath);

  try {
    if (file.mimetype.startsWith("image/") && isCompress) {
      const transformedFile = await sharp(file.path).resize(size).toBuffer();
      fs.unlinkSync(file.path);
      fs.writeFileSync(filePath, transformedFile);
    } else {
      fs.renameSync(file.path, filePath);
    }
    return fileName;
  } catch {
    return false;
  }
}

export async function singleFileUploadManager(file, isCompress, size) {
  return file ? await multerFileUploader(file, isCompress, size) : null;
}

export async function multipleFilesUploadManager(files, isCompress, size) {
  if (!files || !files.length) return null;
  const uploadPromises = files.map((file) =>
    multerFileUploader(file, isCompress, size)
  );
  const results = await Promise.all(uploadPromises);
  return results.includes(false) ? null : results;
}

// Main Functions
async function uploadASingleFile(file, isCompress, size) {
  try {
    return USE_AWS
      ? await uploadSingleAWSFile(file)
      : await singleFileUploadManager(file, isCompress, size);
  } catch (error) {
    throw error;
  }
}

async function uploadMultipleFiles(files, isCompress, size) {
  try {
    return USE_AWS
      ? await uploadMultipleAWSFiles(files)
      : await multipleFilesUploadManager(files, isCompress, size);
  } catch (error) {
    throw error;
  }
}

async function removeFile(fileName) {
  return USE_AWS ? await removeAWSFile(fileName) : fileRemover(fileName);
}

// In services/file.service.js

// Define the fields for KYC documents
const kycFields = [
  { name: "civilIdFront", maxCount: 1 },
  { name: "civilIdBack", maxCount: 1 },
  { name: "passport", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 }, // ✅ Add this
];

// Multer configuration for multiple KYC fields
export const kycUploadRoute = multer({ storage: multer.memoryStorage() }).fields(
  kycFields
);

async function downloadImageToFile(imageUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          return reject(
            new Error(
              `Failed to download image, status code: ${response.statusCode}`
            )
          );
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            originalname: `${randomStringGenerator(
              6,
              "alphabetic",
              false
            )}_image.jpg`,
            mimetype: response.headers["content-type"],
            buffer,
          });
        });
      })
      .on("error", (err) => {
        reject(new Error("Could not download image"));
      });
  });
}

// Exported Functions
export {
  fileDestination,
  singleUploadRoute,
  multiUploadRoute,
  uploadASingleFile,
  uploadMultipleFiles,
  removeFile,
  downloadImageToFile,
  fileNameGenerator,
  isPhoto,
};
