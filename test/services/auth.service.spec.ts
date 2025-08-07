import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto } from 'src/auth/dto/register-auth.dto';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';

const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'Password123!';
    const hashedPassword = 'hashed_password';
    const user = { id: 'user-uuid', email, password: hashedPassword };

    it('should return the user if credentials are valid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const { password: pw, ...expectedUser } = user;
      const result = await service.validateUser(email, password);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if password does not match', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { id: 'user-uuid', email: 'test@example.com' };
      const expectedToken = 'jwt_token';
      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({ access_token: expectedToken });
    });
  });

  describe('register', () => {
    it('should create and return a new user', async () => {
      const registerDto: RegisterDto = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123!',
      };
      const createdUser = {
        ...registerDto,
        id: 'new-uuid',
        stellarAddress: 'G...',
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashed_password'));
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...registerDto,
          password: 'hashed_password',
        }),
      );
      expect(result).toEqual(createdUser);
    });
  });
});