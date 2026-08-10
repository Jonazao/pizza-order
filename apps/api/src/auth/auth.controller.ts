import { Controller, Post, Body, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserEntity, CurrentToken } from '../common';
import { AUTH_ROUTES } from './routes';
import { AuthResponse, LogoutResponse } from './interfaces/auth.interface';

@ApiTags('Authentication')
@Controller(AUTH_ROUTES.base)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post(AUTH_ROUTES.register)
  @ApiOperation({ summary: 'Register a new Customer user' })
  @ApiResponse({ status: 201, description: 'User registered successfully and session token returned' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post(AUTH_ROUTES.login)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user (Customer or Employee) and return JWT session token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post(AUTH_ROUTES.logout)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate active user session' })
  @ApiResponse({ status: 200, description: 'Session destroyed successfully' })
  async logout(@CurrentToken() token: string | null): Promise<LogoutResponse> {
    return this.authService.logout(token);
  }

  @Get(AUTH_ROUTES.profile)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve authenticated user profile and role' })
  @ApiResponse({ status: 200, description: 'Returns authenticated user info' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token/session' })
  getProfile(@CurrentUser() user: CurrentUserEntity): CurrentUserEntity {
    return user;
  }
}
