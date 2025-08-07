import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    console.log('Secret Key usada na JwtStrategy:', secret);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('Validando token com o payload:', payload);

    if (!payload || !payload.sub) {
      console.error('Payload do JWT não contém a propriedade "sub"!');
      throw new UnauthorizedException('Token inválido.');
    }

    const user = await this.usersService.findOne(payload.sub);

    console.log('Resultado da busca pelo usuário (findOne):', user);

    if (!user) {
      throw new UnauthorizedException('Usuário do token não encontrado.');
    }
    return user;
  }
}
