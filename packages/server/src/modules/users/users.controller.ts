import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return this.usersService.getProfile(user.id);
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Post('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(user.id, changePasswordDto);
  }

  @Get('listings')
  async getUserListings(
    @CurrentUser() user: User,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.usersService.getUserListings(user.id, page, limit);
  }

  @Post('deactivate')
  async deactivateAccount(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.usersService.deactivateAccount(user.id);
  }

  @Post('reactivate')
  async reactivateAccount(
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.usersService.reactivateAccount(user.id);
  }
}
