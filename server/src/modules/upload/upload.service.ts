import { Injectable } from '@nestjs/common'
import { S3Storage } from 'coze-coding-dev-sdk'

@Injectable()
export class UploadService {
  private storage: S3Storage

  constructor() {
    this.storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing'
    })
  }

  async uploadFile(file: Express.Multer.File) {
    // 使用 memoryStorage 时，file.buffer 存在
    const fileContent = file.buffer
    
    // 生成文件名（添加日期前缀避免冲突）
    const fileName = `reports/${Date.now()}_${file.originalname}`
    
    // 上传到对象存储
    const key = await this.storage.uploadFile({
      fileContent,
      fileName,
      contentType: file.mimetype
    })

    // 生成访问 URL
    const url = await this.storage.generatePresignedUrl({
      key,
      expireTime: 86400 * 30 // 30天有效期
    })

    return { key, url }
  }

  async getFileUrl(key: string) {
    return await this.storage.generatePresignedUrl({
      key,
      expireTime: 86400 // 1天有效期
    })
  }
}
