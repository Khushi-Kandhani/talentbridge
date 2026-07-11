import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * On connection, clients must pass their JWT access token either as
 * `socket.handshake.auth.token` or an `Authorization: Bearer <token>` header.
 * Once verified, the socket is joined to a room named `user:<userId>` so
 * the backend can push targeted, real-time notifications to a single user
 * (e.g. "your application advanced to Shortlisted") without broadcasting
 * to everyone.
 */
@WebSocketGateway({ cors: true })
export class TalentBridgeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TalentBridgeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload: any = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.join(`user:${payload.sub}`);
      client.join(`role:${payload.role}`);
    } catch (error) {
      this.logger.warn(`WebSocket auth failed, disconnecting client: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /** Push a notification to a single user (e.g. the candidate who owns an application). */
  notifyUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /** Push a notification to everyone with a given role (e.g. all recruiters). */
  notifyRole(role: string, event: string, payload: unknown) {
    this.server.to(`role:${role}`).emit(event, payload);
  }
}
