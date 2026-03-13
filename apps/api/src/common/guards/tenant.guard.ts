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
import { PrismaService } from '../../modules/prisma/prisma.service';

const AGGREGATOR_HOSTS = new Set([
  'bluestay.in',
  'www.bluestay.in',
  'localhost',
  '127.0.0.1',
]);

type DomainCacheEntry = {
  hotelId: string | null;
  expiresAt: number;
};

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly domainCache = new Map<string, DomainCacheEntry>();
  private readonly cacheTtlMs = 5 * 60 * 1000;

  constructor(private readonly prisma: PrismaService) {}

  private normalizeHost(value?: string): string | null {
    if (!value) return null;
    const candidate = value
      .trim()
      .replace(/^https?:\/\//i, '')
      .split('/')[0]
      .split(':')[0]
      .toLowerCase();
    return candidate || null;
  }

  private extractHosts(req: any): string[] {
    const values = [
      req?.headers?.['x-hotel-domain'],
      req?.headers?.['x-forwarded-host'],
      req?.headers?.host,
      req?.headers?.origin,
      req?.headers?.referer,
    ];

    const normalized = values
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((value) => this.normalizeHost(String(value || '')))
      .filter((value): value is string => Boolean(value));

    return [...new Set(normalized)];
  }

  private async resolveHotelIdFromDomain(host: string): Promise<string | null> {
    const cached = this.domainCache.get(host);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.hotelId;
    }

    if (AGGREGATOR_HOSTS.has(host)) {
      this.domainCache.set(host, { hotelId: null, expiresAt: Date.now() + this.cacheTtlMs });
      return null;
    }

    const parts = host.split('.');
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'bluestay.in' && parts[0] !== 'www') {
      const hotel = await this.prisma.hotel.findUnique({
        where: { slug: parts[0] },
        select: { id: true },
      });
      const hotelId = hotel?.id ?? null;
      this.domainCache.set(host, { hotelId, expiresAt: Date.now() + this.cacheTtlMs });
      return hotelId;
    }

    const mapping = await this.prisma.hotelDomain.findUnique({
      where: { domain: host },
      select: { hotelId: true },
    });
    const hotelId = mapping?.hotelId ?? null;
    this.domainCache.set(host, { hotelId, expiresAt: Date.now() + this.cacheTtlMs });
    return hotelId;
  }

  private extractRequestHotelId(req: any): string | null {
    const headerHotelId = req?.headers?.['x-hotel-id'];
    if (headerHotelId && typeof headerHotelId === 'string') {
      return headerHotelId;
    }

    const queryHotelId = req?.query?.hotelId;
    if (queryHotelId && typeof queryHotelId === 'string') {
      return queryHotelId;
    }

    const bodyHotelId = req?.body?.hotelId;
    if (bodyHotelId && typeof bodyHotelId === 'string') {
      return bodyHotelId;
    }

    const variableHotelId = req?.body?.variables?.hotelId;
    if (variableHotelId && typeof variableHotelId === 'string') {
      return variableHotelId;
    }

    const nestedInputHotelId = req?.body?.variables?.input?.hotelId;
    if (nestedInputHotelId && typeof nestedInputHotelId === 'string') {
      return nestedInputHotelId;
    }

    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
    const requestHotelId = this.extractRequestHotelId(req);

    // If a specific hotel is being accessed, verify it matches
    if (requestHotelId && requestHotelId !== user.hotelId) {
      throw new ForbiddenException(
        'You can only access data for your own hotel',
      );
    }

    // Enforce domain -> hotel mapping consistency for hotel users.
    const hosts = this.extractHosts(req);
    for (const host of hosts) {
      const mappedHotelId = await this.resolveHotelIdFromDomain(host);
      if (mappedHotelId && mappedHotelId !== user.hotelId) {
        throw new ForbiddenException(
          'Domain tenant does not match authenticated hotel account',
        );
      }
    }

    return true;
  }
}
