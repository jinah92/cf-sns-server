import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { TEMP_FOLDER_PATH } from '../common/const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10000000, // 바이트 단위로 입력
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb (callback)
         * 첫번쨰 파라미터 : 에러가 있을 경우 에러 정보를 넣어줌
         * 두번째 파라미터 : 파일을 받을지 여부를 boolean으로 넣어줌
         */
        const ext = extname(file.originalname); // xxx.jpg => .jpg

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다'),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, cb) {
          cb(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, cb) {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
