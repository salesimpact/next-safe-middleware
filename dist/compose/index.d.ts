import { NextResponse, NextMiddleware, NextRequest, NextFetchEvent } from 'next/server';

declare type NextMiddlewareResult = NextResponse | Response | null | undefined;

declare type ChainFinalizer = (req: NextRequest, evt: NextFetchEvent, ctx: Readonly<MiddlewareChainContext>) => void | Promise<void>;
declare type MiddlewareChainContext = {
    readonly res: {
        readonly get: () => Response | NextResponse;
        readonly set: (res: Response | NextResponse) => void;
    };
    readonly cache: {
        readonly get: (key: string) => unknown;
        readonly set: (key: string, value: unknown) => void;
    };
    readonly finalize: {
        readonly addCallback: (finalizer: ChainFinalizer) => void;
    };
};
declare type ChainableMiddleware = (...params: [
    ...spec: Parameters<NextMiddleware>,
    ctx: MiddlewareChainContext
]) => NextMiddlewareResult | void | Promise<NextMiddlewareResult | void>;
declare type MiddlewareChain = (...middlewares: (ChainableMiddleware | Promise<ChainableMiddleware>)[]) => NextMiddleware;
declare type NextRequestPredicate = (req: NextRequest) => boolean;
declare type ChainMatcher = NextRequestPredicate;

declare const memoizeInChain: <Args extends any[], T>(key: string, f: (...args: Args) => T | Promise<T>) => (...args: Args) => (ctx: MiddlewareChainContext) => Promise<T>;
declare const memoize: <Args extends any[], T>(f: (...args: Args) => T | Promise<T>) => (...args: Args) => Promise<T>;
declare const memoizeResponseHeader: <T>(header: string, fromHeaderValue: (x: string) => T, toHeaderValue: (x: T) => string, merger?: (x1: T, x2: T) => T) => (ctx: MiddlewareChainContext) => [T, (value: T) => void];

declare const matchNot: (matcher: NextRequestPredicate) => NextRequestPredicate;
declare const matchAnd: (...matchers: NextRequestPredicate[]) => NextRequestPredicate;
declare const matchOr: (...matchers: NextRequestPredicate[]) => NextRequestPredicate;
declare const isPagePathRequest: NextRequestPredicate;
declare const isPreviewModeRequest: NextRequestPredicate;
declare const isNextJsDataRequest: NextRequestPredicate;
declare const isPageRequest: NextRequestPredicate;

/**
 *
 * @param middlewares the middlewares to chain in sequence
 * @returns
 * the chained middlewares as a single Next.js middleware
 * to export from `middleware.js`
 *
 */
declare const chain: (...middlewares: Parameters<MiddlewareChain>) => NextMiddleware;
/**
 *
 * @param matcher
 * predicate on a NextRequest, whether a middleware chain should run on it
 * @returns
 * a matched chain function that will only run chained middlewares on matched requests
 * @example
 * import { csp, strictDynamic, chainMatch, isPageRequest } from `@next-safe/middleware`
 *
 * const securityMiddlewares = [csp(), strictDynamic()];
 *
 * export default chainMatch(isPageRequest)(...securityMiddlewares);
 *
 */
declare const chainMatch: (matcher: ChainMatcher) => MiddlewareChain;
declare const chainableMiddleware: (middleware: ChainableMiddleware) => ChainableMiddleware;
/**
 *
 * @param nextMiddleware
 * a Next.js middleware, according to spec
 * @returns
 * a chainable middleware that continues
 * the response (if any) of `nextMiddleware` to a chain context
 */
declare const continued: (nextMiddleware: NextMiddleware) => ChainableMiddleware;

export { chain, chainMatch, chainableMiddleware, continued, isNextJsDataRequest, isPagePathRequest, isPageRequest, isPreviewModeRequest, matchAnd, matchNot, matchOr, memoize, memoizeInChain, memoizeResponseHeader };
