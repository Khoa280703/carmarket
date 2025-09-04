import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import {
  ListingDetail,
  ListingStatus,
} from '../../entities/listing-detail.entity';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ListingDetail)
    private readonly listingRepository: Repository<ListingDetail>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'role',
        'isActive',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingListings(page: number = 1, limit: number = 10) {
    const [listings, total] = await this.listingRepository.findAndCount({
      where: { status: ListingStatus.PENDING },
      relations: ['carDetail', 'carDetail.images', 'seller'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveListing(listingId: string): Promise<{ message: string }> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    await this.listingRepository.update(listingId, {
      status: ListingStatus.APPROVED,
      approvedAt: new Date(),
    });

    return { message: 'Listing approved successfully' };
  }

  async rejectListing(
    listingId: string,
    reason?: string,
  ): Promise<{ message: string }> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    await this.listingRepository.update(listingId, {
      status: ListingStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason: reason,
    });

    return { message: 'Listing rejected successfully' };
  }

  async getTransactions(page: number = 1, limit: number = 10) {
    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        relations: ['buyer', 'seller', 'listing'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalListings = await this.listingRepository.count();
    const pendingListings = await this.listingRepository.count({
      where: { status: ListingStatus.PENDING },
    });
    const totalTransactions = await this.transactionRepository.count();

    return {
      totalUsers,
      totalListings,
      pendingListings,
      totalTransactions,
    };
  }
}
