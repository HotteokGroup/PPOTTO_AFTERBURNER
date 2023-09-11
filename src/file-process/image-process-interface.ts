export interface ResizeImageToWebpOptions {
  image: Buffer;
  width: number;
  height?: number;
}

export interface GetFileFromS3Options {
  /** 버킷 이름 */
  bucket: string;
  /** 파일 위치 */
  key: string;
}

export interface SaveFileToS3Options {
  /** 버킷 이름 */
  bucket: string;
  /** 저장할 위치 */
  key: string;
  /** 저장할 파일 */
  file: Buffer;
}
