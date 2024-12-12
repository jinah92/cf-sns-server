import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * 구현 기능
 *
 * 1. 요청객체(request)를 불러오고, authorization header로부터 토큰을 가져온다.
 * 2. authService.extractTokenFromHeader를 이용해서 사용할 수 있는 형태의 토큰을 추출한다.
 * 3. authService.decoeBasicToken을 이용해서 email, password를 추출한다.
 * 4. authService.authenticateWithEmailAndPassword를 이용해서 email, password를 이용해서 사용자를 가져온다.
 * 5. 찾아낸 사용자를 (1) 요청객체에 붙여준다.
 *    req.user = user
 */
@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    req.user = user;

    return true;
  }
}
