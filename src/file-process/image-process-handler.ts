import { Handler, S3Event } from "aws-lambda";
import * as sharp from "sharp";
import { S3 } from "aws-sdk";
import { GetFileFromS3Options, ResizeImageToWebpOptions, SaveFileToS3Options } from "./image-process-interface";
import { getSequelize } from "../lib/sequelize/sequelize-service";
import userFileStore from "../lib/sequelize/model/user-file-store";

const s3 = new S3();

export const imageProcess: Handler = async (event: S3Event) => {
  // 오늘 날자를 텍스트로 구한다
  const TODAY = new Date().toISOString().split("T")[0];
  // 이벤트에서 버킷 이름과 파일 위치를 가져온다
  const s3Event = event.Records[0].s3;
  const bucketName = s3Event.bucket.name;
  const originalKey = s3Event.object.key;
  const fileName = originalKey.match(/(?<=\/)[^\/]+(?=\.\w+)/)?.pop();
  if (!fileName) {
    console.log(JSON.stringify(event));
    throw new Error("파일 이름을 찾을 수 없습니다");
  }
  console.log(`파일 이름: ${fileName} 경로 : ${originalKey}`);

  // // 파일을 가져온다
  const originalImage = await getFileFromS3({ bucket: bucketName, key: originalKey });

  // 리사이징 후 webp 형식으로 변환한다
  const [smallImage, largeImage, originalCompressImage] = await Promise.allSettled([
    resizeImageToWebp({ image: originalImage, width: 222 }),
    resizeImageToWebp({ image: originalImage, width: 714 }),
    resizeImageToWebp({ image: originalImage, width: 1400 }),
  ]);

  if (
    smallImage.status === "rejected" ||
    largeImage.status === "rejected" ||
    originalCompressImage.status === "rejected"
  ) {
    if (smallImage.status === "rejected") console.log(smallImage.reason);
    if (largeImage.status === "rejected") console.log(largeImage.reason);
    if (originalCompressImage.status === "rejected") console.log(originalCompressImage.reason);
    throw new Error("이미지 리사이징에 실패했습니다");
  }

  // 리사이징한 이미지를 저장한다
  const smallImageKey = `output/${TODAY}/${fileName}/small.webp`;
  const largeImageKey = `output/${TODAY}/${fileName}/large.webp`;
  const originalCompressImageKey = `output/${TODAY}/${fileName}/original-compress.webp`;
  const [smallImageSaveResult, largeImageSaveResult, originalCompressImageSaveResult] = await Promise.allSettled([
    saveFileToS3({ bucket: bucketName, key: smallImageKey, file: smallImage.value }),
    saveFileToS3({ bucket: bucketName, key: largeImageKey, file: largeImage.value }),
    saveFileToS3({ bucket: bucketName, key: originalCompressImageKey, file: originalCompressImage.value }),
  ]);
  if (
    smallImageSaveResult.status === "rejected" ||
    largeImageSaveResult.status === "rejected" ||
    originalCompressImageSaveResult.status === "rejected"
  ) {
    if (smallImageSaveResult.status === "rejected") console.log(smallImageSaveResult.reason);
    if (largeImageSaveResult.status === "rejected") console.log(largeImageSaveResult.reason);
    if (originalCompressImageSaveResult.status === "rejected") console.log(originalCompressImageSaveResult.reason);
    throw new Error("이미지 저장에 실패했습니다");
  }
  // 결과를 데이터베이스에 업데이트한다
  const dbConnection = await getSequelize();
  const userFileStoreRepository = await userFileStore(dbConnection);
  // 해당 파일이 있는지 확인한다
  const file = await userFileStoreRepository.findOne({
    where: {
      id: fileName,
    },
  });
  if (file) {
    // 있다면 업데이트한다
    await userFileStoreRepository.update(
      {
        fileName,
        originalUrl: originalKey,
        smallUrl: smallImageKey,
        largeUrl: largeImageKey,
        originalCompressedUrl: originalCompressImageKey,
      },
      {
        where: {
          id: fileName,
        },
      }
    );
  }
  await dbConnection.connectionManager.close();
};

/**
 * 이미지를 리사이징 후 webP 형식으로 변환하여 리턴한다
 *
 * @param image Buffer 이미지
 * @param width 너비
 * @param height 높이
 * @returns webp 형식의 이미지 buffer
 */
async function resizeImageToWebp(params: ResizeImageToWebpOptions): Promise<Buffer> {
  const { image, width, height } = params;

  return sharp(image).withMetadata().resize(width, height).webp({ lossless: true }).toBuffer();
}

async function getFileFromS3({ bucket, key }: GetFileFromS3Options) {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  const data = await s3.getObject(params).promise();
  return data.Body as Buffer;
}

async function saveFileToS3({ bucket, key, file }: SaveFileToS3Options) {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: file,
    //ContentType: "image/webp",
  };
  await s3.putObject(params).promise();
}
