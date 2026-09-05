import { Role } from "@/types";

export interface SubNavItem {
  label: string;
  href: string;
  matchPrefix?: string;
  roles?: Role[];
}

export interface NavItemDef {
  label: string;
  href?: string;
  matchPrefixes?: string[];
  icon?: any;
  roles?: Role[];
  subItems?: SubNavItem[];
}

/**
 * Returns the single best matching sub-item for a given pathname.
 * Mathematically guarantees that exact matches take priority over prefix matches,
 * and longer prefixes take priority over shorter prefixes.
 */
export function getActiveSubItem<T extends SubNavItem>(subItems: T[], pathname: string): T | null {
  let bestMatch: T | null = null;
  let bestMatchLength = -1;

  for (const sub of subItems) {
    const target = sub.matchPrefix || sub.href;

    // 1. Exact match (Highest Priority)
    if (pathname === target || pathname === sub.href) {
      return sub;
    }

    // 2. Exact sub-route match (must be followed by "/" or "?")
    if (
      pathname.startsWith(`${target}/`) ||
      pathname.startsWith(`${target}?`) ||
      pathname.startsWith(`${sub.href}/`) ||
      pathname.startsWith(`${sub.href}?`)
    ) {
      const len = target.length;
      if (len > bestMatchLength) {
        bestMatch = sub;
        bestMatchLength = len;
      }
    }
  }

  return bestMatch;
}

/**
 * Determines whether a top-level parent menu item or nav item is active for the current pathname.
 */
export function isParentNavActive(item: NavItemDef, pathname: string): boolean {
  if (item.href) {
    if (pathname === item.href) return true;
    if (item.href !== "/dashboard" && (pathname.startsWith(`${item.href}/`) || pathname.startsWith(`${item.href}?`))) {
      return true;
    }
  }

  if (item.matchPrefixes) {
    if (item.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}?`))) {
      return true;
    }
  }

  if (item.subItems && item.subItems.length > 0) {
    return getActiveSubItem(item.subItems, pathname) !== null;
  }

  return false;
}
