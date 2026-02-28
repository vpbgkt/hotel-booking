import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, OTPResponse, User } from '../user/entities/user.entity';
import { 
  LoginInput, 
  RegisterInput, 
  RequestOTPInput, 
  VerifyOTPInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './dto/auth.input';
import { GqlAuthGuard } from './guards/jwt-auth.guard';
import { GqlCurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class LogoutResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   */
  @Public()
  @Mutation(() => AuthResponse, { 
    name: 'register', 
    description: 'Register a new user' 
  })
  async register(
    @Args('input') input: RegisterInput,
  ) {
    return this.authService.register(input);
  }

  /**
   * Login with email and password
   */
  @Public()
  @Mutation(() => AuthResponse, { 
    name: 'login', 
    description: 'Login with email and password' 
  })
  async login(
    @Args('input') input: LoginInput,
  ) {
    return this.authService.login(input);
  }

  /**
   * Request OTP for phone login
   */
  @Public()
  @Mutation(() => OTPResponse, { 
    name: 'requestOTP', 
    description: 'Request OTP for phone login' 
  })
  async requestOTP(
    @Args('input') input: RequestOTPInput,
  ) {
    return this.authService.requestOTP(input);
  }

  /**
   * Verify OTP and login
   */
  @Public()
  @Mutation(() => AuthResponse, { 
    name: 'verifyOTP', 
    description: 'Verify OTP and login/register' 
  })
  async verifyOTP(
    @Args('input') input: VerifyOTPInput,
  ) {
    return this.authService.verifyOTP(input);
  }

  /**
   * Refresh access token
   */
  @Public()
  @Mutation(() => AuthResponse, { 
    name: 'refreshToken', 
    description: 'Refresh access token using refresh token' 
  })
  async refreshToken(
    @Args('input') input: RefreshTokenInput,
  ) {
    return this.authService.refreshToken(input.refreshToken);
  }

  /**
   * Logout
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => LogoutResponse, { 
    name: 'logout', 
    description: 'Logout and revoke refresh token' 
  })
  async logout(
    @GqlCurrentUser() user: User,
  ) {
    return this.authService.logout(user.id);
  }

  /**
   * Get current user
   */
  @UseGuards(GqlAuthGuard)
  @Query(() => User, { 
    name: 'me', 
    description: 'Get current logged in user' 
  })
  async me(
    @GqlCurrentUser() user: User,
  ) {
    return user;
  }

  /**
   * Change password
   */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => LogoutResponse, { 
    name: 'changePassword', 
    description: 'Change password for logged in user' 
  })
  async changePassword(
    @GqlCurrentUser() user: User,
    @Args('input') input: ChangePasswordInput,
  ) {
    return this.authService.changePassword(user.id, input);
  }
}
