const { DataSource } = require('typeorm');
const { User } = require('./dist/entities/user.entity');
const { CarDetail } = require('./dist/entities/car-detail.entity');
const { CarImage } = require('./dist/entities/car-image.entity');
const { ListingDetail } = require('./dist/entities/listing-detail.entity');
const { Transaction } = require('./dist/entities/transaction.entity');
const { CarMake } = require('./dist/entities/car-make.entity');
const { CarModel } = require('./dist/entities/car-model.entity');
const { CarMetadata } = require('./dist/entities/car-metadata.entity');
const { Favorite } = require('./dist/entities/favorite.entity');
const {
  ChatConversation,
} = require('./dist/entities/chat-conversation.entity');
const { ChatMessage } = require('./dist/entities/chat-message.entity');
const {
  ListingPendingChanges,
} = require('./dist/entities/listing-pending-changes.entity');
const { ActivityLog } = require('./dist/entities/activity-log.entity');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'carmarket_user',
  password: 'carmarket_password',
  database: 'carmarket',
  entities: [
    User,
    CarDetail,
    CarImage,
    ListingDetail,
    Transaction,
    CarMake,
    CarModel,
    CarMetadata,
    Favorite,
    ChatConversation,
    ChatMessage,
    ListingPendingChanges,
    ActivityLog,
  ],
  synchronize: true,
});

async function updateUserRole() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Update the user with email admin@example.com to admin role
    const result = await userRepository.update(
      { email: 'admin@example.com' },
      { role: 'admin' },
    );

    console.log('Updated user role:', result);

    // Verify the update
    const user = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });
    console.log('User after update:', {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await AppDataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserRole();
