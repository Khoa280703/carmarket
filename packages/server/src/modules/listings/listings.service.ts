import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ListingDetail,
  ListingStatus,
} from '../../entities/listing-detail.entity';
import { CarDetail } from '../../entities/car-detail.entity';
import { CarImage } from '../../entities/car-image.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(ListingDetail)
    private readonly listingRepository: Repository<ListingDetail>,
    @InjectRepository(CarDetail)
    private readonly carDetailRepository: Repository<CarDetail>,
    @InjectRepository(CarImage)
    private readonly carImageRepository: Repository<CarImage>,
  ) {}

  async create(
    userId: string,
    createListingDto: CreateListingDto,
  ): Promise<ListingDetail> {
    const { carDetail, images, ...listingData } = createListingDto;

    // Create car detail
    const newCarDetail = this.carDetailRepository.create(carDetail);
    const savedCarDetail = await this.carDetailRepository.save(newCarDetail);

    // Create listing
    const listing = this.listingRepository.create({
      ...listingData,
      sellerId: userId,
      carDetailId: savedCarDetail.id,
      status: ListingStatus.PENDING,
    });

    const savedListing = await this.listingRepository.save(listing);

    // Create car images if provided
    if (images && images.length > 0) {
      const carImages = images.map((image, index) =>
        this.carImageRepository.create({
          ...image,
          carDetailId: savedCarDetail.id,
          sortOrder: index,
        }),
      );
      await this.carImageRepository.save(carImages);
    }

    return this.findOne(savedListing.id);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [listings, total] = await this.listingRepository.findAndCount({
      where: { status: ListingStatus.APPROVED, isActive: true },
      relations: ['carDetail', 'carDetail.images', 'seller'],
      order: { createdAt: 'DESC' },
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

  async findOne(id: string): Promise<ListingDetail> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['carDetail', 'carDetail.images', 'seller'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Increment view count
    await this.listingRepository.update(id, {
      viewCount: listing.viewCount + 1,
    });

    return listing;
  }

  async update(
    id: string,
    userId: string,
    updateListingDto: UpdateListingDto,
  ): Promise<ListingDetail> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['carDetail'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    const { carDetail, ...listingData } = updateListingDto;

    // Update car detail if provided
    if (carDetail) {
      await this.carDetailRepository.update(listing.carDetailId, carDetail);
    }

    // Update listing
    await this.listingRepository.update(id, {
      ...listingData,
      status: ListingStatus.PENDING, // Reset to pending after update
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const listing = await this.listingRepository.findOne({
      where: { id },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    await this.listingRepository.remove(listing);

    return { message: 'Listing deleted successfully' };
  }
}
