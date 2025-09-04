import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('listings/pending')
  getPendingListings(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.adminService.getPendingListings(page, limit);
  }

  @Put('listings/:id/approve')
  approveListing(@Param('id') id: string) {
    return this.adminService.approveListing(id);
  }

  @Put('listings/:id/reject')
  rejectListing(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.rejectListing(id, reason);
  }

  @Get('transactions')
  getTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.adminService.getTransactions(page, limit);
  }
}
