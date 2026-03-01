import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

/**
 * Audit Log Interceptor
 * 
 * Logs all GraphQL mutations with user info, operation name, and timing.
 * In production, these would be stored in a database or external service.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();

    // Only audit mutations (not queries)
    if (info?.parentType?.name !== 'Mutation') {
      return next.handle();
    }

    const req = ctx.getContext()?.req;
    const user = req?.user;
    const operationName = info?.fieldName || 'unknown';
    const args = ctx.getArgs();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            JSON.stringify({
              type: 'MUTATION',
              operation: operationName,
              userId: user?.id || 'anonymous',
              userEmail: user?.email || 'anonymous',
              userRole: user?.role || 'unknown',
              hotelId: user?.hotelId || null,
              duration: `${duration}ms`,
              ip: req?.ip || req?.connection?.remoteAddress,
              timestamp: new Date().toISOString(),
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            JSON.stringify({
              type: 'MUTATION_ERROR',
              operation: operationName,
              userId: user?.id || 'anonymous',
              error: error?.message,
              duration: `${duration}ms`,
              ip: req?.ip || req?.connection?.remoteAddress,
              timestamp: new Date().toISOString(),
            }),
          );
        },
      }),
    );
  }
}
