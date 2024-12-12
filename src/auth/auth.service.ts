import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  /**
   *  1) registerWithEmail
   *    - email, nickname, password를 입력받고 사용자를 생성한다.
   *    - 생성이 완료되면 accessToken과 refeshToken을 반환한다. (자동 로그인)
   *
   *  2) loginWithEmail
   *    - email, password을 입력하면 사용자 검증을 진행한다.
   *    - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
   *
   *  3) loginUser
   *    - 1), 2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
   *
   *  4) signToken
   *    - 3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
   *
   *  5) authenticateWithEmailAndPassword
   *    - 2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *      1. 사용자가 존재하는지 확인 (email)
   *      2. 비밀번호가 일치하는지 확인
   *      3. 모두 통과되면 찾은 사용자 정보를 반환
   *      4. loginWithEmail에서 반환된 데이터 기반으로 토큰 생성
   */

  /**
   * Payload에 들어갈 정보
   *
   * 1) email
   * 2) sub => id
   * 3) type: 'access' | 'refresh'
   */
  signToken(
    user: Pick<UsersModel, 'email' | 'id'>,
    isRefreshToken: boolean = false,
  ) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // seconds
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  async loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user),
      refreshToken: this.signToken(user, true),
    };
  }
}
