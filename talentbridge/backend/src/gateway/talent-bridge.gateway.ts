import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class TalentBridgeGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('pipeline:update')
  handlePipelineUpdate(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    this.server.emit('pipeline:updated', {
      receivedBy: client.id,
      payload: data,
    });
  }
}
