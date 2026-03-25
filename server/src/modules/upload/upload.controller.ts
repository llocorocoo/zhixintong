import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { UploadService } from './upload.service'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB 限制
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        code: 400,
        message: '请选择要上传的文件',
        data: null
      }
    }

    console.log('文件信息:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })

    try {
      const result = await this.uploadService.uploadFile(file)
      return {
        code: 200,
        message: '上传成功',
        data: {
          key: result.key,
          url: result.url
        }
      }
    } catch (error) {
      console.error('上传失败:', error)
      return {
        code: 500,
        message: '上传失败，请重试',
        data: null
      }
    }
  }
}
