/**
 * Tenant Guard - BlueStay API
 *
 * Ensures hotel admin/staff can only access data for their own hotel.
 * Extracts hotelId from request context and validates against user's assigned hotel.
 * Platform admins bypass this check.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    let req: any;

    // Try GraphQL context first
    try {
      const ctx = GqlExecutionContext.create(context);
      req = ctx.getContext().req;
    } catch {
      req = context.switchToHttp().getRequest();
    }

    const user = req?.user;
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Platform admins can access everything
    if (user.role === 'PLATFORM_ADMIN') {
      return true;
    }

    // Guests can access their own data (handled by business logic, not tenant guard)
    if (user.role === 'GUEST') {
      return true;
    }

    // Hotel admin/staff must have a hotelId assigned
    if (!user.hotelId) {
      throw new ForbiddenException('User is not associated with any hotel');
    }

    // Check if hotelId in the request matches the user's hotel
    const requestHotelId =
      req.headers?.['x-hotel-id'] ||
      req.query?.hotelId ||
      req.body?.hotelId;

    // If a specific hotel is being accessed, verify it matches
    if (requestHotelId && requestHotelId !== user.hotelId) {
      throw new ForbiddenException(
        'You can only access data for your own hotel',
      );
    }

    return true;
  }
}
