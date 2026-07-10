import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = 'Internal server error';
        if (error instanceof HttpException) {
          const res = error.getResponse();
          if (typeof res === 'string') {
            message = res;
          } else if (typeof res === 'object' && res !== null && 'message' in res) {
            const inner = (res as any).message;
            message = Array.isArray(inner) ? inner[0] : inner;
          }
        }

        const response = {
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
        };
        throw new HttpException(response, status);
      }),
    );
  }
}
