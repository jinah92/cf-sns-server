import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from '../users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * 토큰을 사용하는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면, accessToken과 refreshToken을 발급받는다.
   * 2) 로그인 할때는 Basic 토큰과 함께 요청을 보낸다. Basic 토큰은 '이메일:비밀번호'를 Base64 인코딩한 형태이다. (ex) authorization: 'Basic {token}'
   * 3) 아무나 접근할 수 없는 정보 (private route)를 접근할때는 accessToken을 Header에 추가해서 요청과 함께 보낸다. (ex) authorization: 'Bearer {token}'
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자를 식별할 수 있다.
   *    ex) 현재 로그인한 사용자가 작성한 post만을 가져오려면, 토큰의 sub에 입력된 사용자의 포스트만 필터링할 수 있다. (특정 사용자의 토큰이 없다면 다른 사용자의 데이터에 접근하지 못한다.)
   * 5) 모든 토큰은 만료기간이 있다. 만료기간이 지나면 새로 토큰을 발급받아야 한다.
   *    - 만료기간이 지나면 jwtService.verify에서 인증 통과되지 못한다.
   *    - access토큰을 새로 발급 받을 수 있는 요청, refresh토큰을 새로 발급 받을 수 있는 요청이 필요하다.
   */

  extractTokenFromHeader(header: string, isBearer: boolean = false) {
    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('잘못된 토큰입니다');
    }

    return splitToken[1]; // 토큰값 반환
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8'); // base64 => string으로 디코딩

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 유형의 토큰입니다.');
    }

    const [email, password] = split;

    return {
      email,
      password,
    };
  }

  /** 토큰 검증 */
  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  rotateToken(token: string, isRefreshToken: boolean = false) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     * sub: id
     * email: email
     * type: 'access' | 'refresh'
     */
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        '토큰 재발급은 refresh 토큰으로만 가능합니다',
      );
    }

    return this.signToken({
      ...decoded,
      isRefreshToken,
    });
  }

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

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    /**
     * 1. 사용자가 존재하는지 확인(email)
     * 2. 비밀번호가 맞는지 확인
     * 3. 모두 통과되면 찾은 사용자 정보를 반환
     */
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('존재하지 않는 사용자');
    }

    /**
     * 입력된 비밀번호
     * 기존 해시 => 사용자 정보에 저장돼 있는 hash
     */
    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (!passOk) {
      throw new UnauthorizedException('다른 비밀번호');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
