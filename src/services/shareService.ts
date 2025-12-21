import { v4 as uuidv4 } from 'uuid';
import type { SharedQuery, QueryResult } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';

const SHARE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

export function createShare(sql: string, result: QueryResult | null): SharedQuery {
  const sharedQueries = storageService.get<SharedQuery[]>(
    STORAGE_KEYS.SHARED_QUERIES,
    []
  );

  const now = Date.now();
  const share: SharedQuery = {
    id: generateShareId(),
    sql,
    result,
    sharedAt: now,
    expiresAt: now + SHARE_EXPIRATION_MS,
  };

  const validShares = sharedQueries.filter((s) => s.expiresAt > now);

  storageService.set(STORAGE_KEYS.SHARED_QUERIES, [...validShares, share]);

  return share;
}

export function getShare(id: string): SharedQuery | null {
  const sharedQueries = storageService.get<SharedQuery[]>(
    STORAGE_KEYS.SHARED_QUERIES,
    []
  );

  const share = sharedQueries.find((s) => s.id === id);

  if (!share) return null;

  if (share.expiresAt < Date.now()) {
    deleteShare(id);
    return null;
  }

  return share;
}

export function deleteShare(id: string): boolean {
  const sharedQueries = storageService.get<SharedQuery[]>(
    STORAGE_KEYS.SHARED_QUERIES,
    []
  );

  const filtered = sharedQueries.filter((s) => s.id !== id);
  if (filtered.length === sharedQueries.length) return false;

  storageService.set(STORAGE_KEYS.SHARED_QUERIES, filtered);
  return true;
}

export function getShareUrl(shareId: string): string {
  return `${window.location.origin}/share/${shareId}`;
}

function generateShareId(): string {
  return uuidv4().slice(0, 8);
}

export function cleanupExpiredShares(): number {
  const sharedQueries = storageService.get<SharedQuery[]>(
    STORAGE_KEYS.SHARED_QUERIES,
    []
  );

  const now = Date.now();
  const validShares = sharedQueries.filter((s) => s.expiresAt > now);
  const removedCount = sharedQueries.length - validShares.length;

  if (removedCount > 0) {
    storageService.set(STORAGE_KEYS.SHARED_QUERIES, validShares);
  }

  return removedCount;
}
