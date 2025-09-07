import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { MessageType } from '../../entities/chat-message.entity';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start/:listingId')
  startConversation(
    @CurrentUser() user: User,
    @Param('listingId') listingId: string,
  ) {
    return this.chatService.startConversation(user.id, listingId);
  }

  @Post(':conversationId/messages')
  sendMessage(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Body() data: { content: string; type?: MessageType },
  ) {
    return this.chatService.sendMessage(
      user.id,
      conversationId,
      data.content,
      data.type,
    );
  }

  @Get(':conversationId')
  getConversation(@Param('conversationId') conversationId: string) {
    return this.chatService.getConversationWithMessages(conversationId);
  }

  @Get()
  getUserConversations(@CurrentUser() user: User) {
    return this.chatService.getUserConversations(user.id);
  }

  @Post(':conversationId/read')
  markAsRead(
    @CurrentUser() user: User,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.markMessagesAsRead(conversationId, user.id);
  }
}
