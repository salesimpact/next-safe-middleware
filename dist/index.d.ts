import { UriPath, CspDirectives } from '@strict-csp/builder';
export * from '@strict-csp/builder';
import { NextResponse, NextRequest, NextFetchEvent, NextMiddleware } from 'next/server';
export { NextMiddleware } from 'next/server';

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
declare type Middleware = ChainableMiddleware;
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

interface NextUserAgent {
    isBot: boolean;
    ua: string;
    browser: {
        name?: string;
        version?: string;
    };
    device: {
        model?: string;
        type?: string;
        vendor?: string;
    };
    engine: {
        name?: string;
        version?: string;
    };
    os: {
        name?: string;
        version?: string;
    };
    cpu: {
        architecture?: string;
    };
}
declare type ConfigInitializerParams = {
    req: NextRequest;
    evt: NextFetchEvent;
    ctx: MiddlewareChainContext;
    userAgent: NextUserAgent;
};
declare type ConfigInitalizer<Config extends Record<string, unknown>> = (params: ConfigInitializerParams) => Config | Promise<Config>;
declare type MiddlewareConfig<Config extends Record<string, unknown>> = Config | ConfigInitalizer<Config>;

/**
 * A CSP Directive Poroperty
 */
declare type CSPDirective = string | string[];
/**
 * A CSP Config
 */
declare type CSPConfig = {
    "base-uri"?: CSPDirective;
    "child-src"?: CSPDirective;
    "connect-src"?: CSPDirective;
    "default-src"?: CSPDirective;
    "font-src"?: CSPDirective;
    "form-action"?: CSPDirective;
    "frame-ancestors"?: CSPDirective;
    "frame-src"?: CSPDirective;
    "img-src"?: CSPDirective;
    "manifest-src"?: CSPDirective;
    "media-src"?: CSPDirective;
    "object-src"?: CSPDirective;
    "prefetch-src"?: CSPDirective;
    "script-src"?: CSPDirective;
    "style-src"?: CSPDirective;
    "worker-src"?: CSPDirective;
    "block-all-mixed-content"?: CSPDirective;
    "plugin-types"?: CSPDirective;
    "navigate-to"?: CSPDirective;
    "require-sri-for"?: CSPDirective;
    "require-trusted-types-for"?: CSPDirective;
    sandbox?: CSPDirective;
    "script-src-attr"?: CSPDirective;
    "script-src-elem"?: CSPDirective;
    "style-src-attr"?: CSPDirective;
    "style-src-elem"?: CSPDirective;
    "trusted-types"?: CSPDirective;
    "upgrade-insecure-requests"?: CSPDirective;
    "report-to"?: CSPDirective;
    "report-uri"?: CSPDirective;
    reportOnly?: boolean;
};
declare type HeaderConfig = string | false;
declare type PermPolicyDirectiveList = "experimental" | "legacy" | "proposed" | "standard";
/**
 * nextSafe's primary config object
 */
declare type NextSafeConfig = {
    contentTypeOptions?: HeaderConfig;
    /**
     * @deprecated  to configure a CSP, use the `csp` middleware instead and
     * and set `disableCsp` to `true`.
     *
     * violation reporting cannot be set up properly for both directives
     * @see https://github.com/trezy/next-safe/issues/41
     *
     */
    contentSecurityPolicy?: CSPConfig | false;
    frameOptions?: HeaderConfig;
    permissionsPolicy?: {
        [key: string]: string | false;
    } | false;
    permissionsPolicyDirectiveSupport?: PermPolicyDirectiveList[];
    isDev?: boolean;
    referrerPolicy?: HeaderConfig;
    xssProtection?: HeaderConfig;
};
declare type NextSafeCfg = NextSafeConfig & {
    /**
     * set this flag to prevent next-safe to set any CSP header.
     *
     * For CSPs, use the `csp` middleware instead and set this to `true`.
     * You can use `nextSafeMiddleware` for other security headers if you need them.
     *
     *
     * @default false
     */
    disableCsp?: boolean;
};
/**
 * @param cfg config object for next-safe https://trezy.gitbook.io/next-safe/usage/configuration
 * @returns a middleware that adds HTTP response headers the same way next-safe does.
 *
 * To configure a CSP, use the `csp` middleware instead and and set `disableCsp` to `true` in cfg,
 *
 * next-safe adds CSP legacy headers and set up of reporting could be problematic
 * @see https://github.com/trezy/next-safe/issues/41
 *
 * You can use the `nextSafe` middleware for other security headers if you need them.
 *
 * @example
 * import {
 *   chainMatch,
 *   isPageRequest,
 *   csp,
 *   nextSafe,
 *   strictDynamic,
 * } from "@next-safe/middleware";
 *
 * const securityMiddleware = [
 *   nextSafe({ disableCsp: true }),
 *   csp(),
 *   strictDynamic(),
 * ];
 *
 * export default chainMatch(isPageRequest)(...securityMiddleware);
 *
 */
declare const nextSafeMiddleware: (cfg?: MiddlewareConfig<NextSafeCfg>) => ChainableMiddleware;

/**
 * @see https://developers.google.com/web/updates/2018/09/reportingapi#fields
 */
declare type ReportTo = {
    group?: string;
    max_age: number;
    /**
     * @see https://developers.google.com/web/updates/2018/09/reportingapi#load
     */
    endpoints: {
        url: string;
        priority?: number;
        weight?: number;
    }[];
    includeSubdomains?: boolean;
};
declare type ReportingCSP = {
    /** endpoint for the `report-uri` directive */
    reportUri?: UriPath;
    /**
     * group name for the `report-to` directive.
     *
     * Must match a group name in the Report-To header
     *
     * @default "default"
     *
     * @see https://canhas.report/csp-report-to
     *
     * Will be ommitted from CSP if no match for this group name is present in the Report-To header.
     * To unset the `report-to` directive from CSP, set to empty string
     *
     */
    reportTo?: string | "default";
    /**
     * adds `report-sample` to supported directives
     *
     * e.g. if added to script-src, the first 40 characters of a blocked script will be added
     * to the CSP violation report
     *
     * @default true
     * @see https://csper.io/blog/csp-report-filtering
     */
    reportSample?: boolean;
};
declare type ReportingCfg = {
    /**
     * object/object array representing valid Report-To header(s)
     * @see https://developers.google.com/web/updates/2018/09/reportingapi#header
     */
    reportTo?: ReportTo | ReportTo[];
    /**
     * configuration of CSP directives concerned with reporting
     * @see https://canhas.report/csp-report-to
     */
    csp?: ReportingCSP | false;
};
/**
 * @param cfg a configuration object to set up reporting according to the Reporting API spec
 * @returns a middleware that sets response headers according to the configured reporting capabilites
 * @see https://developers.google.com/web/updates/2018/09/reportingapi
 *
 * @example
 * import {
 *   chainMatch,
 *   isPageRequest,
 *   csp,
 *   strictDynamic,
 *   reporting,
 * } from "@next-safe/middleware";
 *
 * const securityMiddleware = [
 *   csp(),
 *   strictDynamic(),
 *   reporting({
 *     csp: {
 *       reportUri: "/api/reporting"
 *     },
 *     reportTo: {
 *       max_age: 1800,
 *       endpoints: [{ url: "/api/reporting" }],
 *     },
 *   }),
 * ];
 *
 * export default chainMatch(isPageRequest)(...securityMiddleware);
 *
 */
declare const reporting: (cfg?: MiddlewareConfig<ReportingCfg>) => ChainableMiddleware;

declare type SupportInfo = {
    /**
     * Whether the browser supports`strict-dynamic`.
     */
    supportsStrictDynamic?: boolean;
    /**
     * Whether the browser supports the `integrity` attribute on <script>` tags
     * in combination with `src` attribute. If a browser doesn't
     * support this, it can't use a Hash-based strict CSP on pages with `getStaticProps`
     */
    supportsSrcIntegrityCheck?: boolean;
};
declare type TellSupported = (userAgent: NextUserAgent) => SupportInfo;
declare type ScriptSrcSources = CspDirectives["script-src"];
/**
 * configuration object for strict CSPs with strict-dynamic
 */
declare type StrictDynamicCfg = {
    /**
     * A fallback value for the `script-src` directive. Used for browsers with `{ supportsStrictDynamic : false }`
     * and for browsers with buggy [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) validation `{ supportsSrcIntegrityCheck : false }` on static routes, because this prevents using a Hash-based Strict CSP.
     *
     * @see https://caniuse.com/?search=strict-dynamic
     * @see https://web.dev/strict-csp/#step-4:-add-fallbacks-to-support-safari-and-older-browsers
     * @see https://github.com/nibtime/next-safe-middleware/issues/5
     *
     * When and how this value get applied, can be customized by
     * the `tellSupported` function and the `inclusiveFallback` flag.
     *
     * @default
     * ['https://', 'unsafe-inline']
     */
    fallbackScriptSrc?: ScriptSrcSources;
    /**
     * In some cases you might have to allow `eval()` for your app to work (e.g. for MDX)
     * This makes the policy slightly less secure, but works alongside `strict-dynamic`
     *
     * @see https://web.dev/strict-csp/#use-of-eval()-in-javascript
     */
    allowUnsafeEval?: true;
    /**
     * @param uaParser a `UAParser` instance from the `ua-parser-js` module
     * @returns a support info that tells how to apply `strict-dynamic`
     *
     * @default
     * {
     *   supportsStrictDynamic: is not Safari < 15.4,
     *   supportsSrcIntegrityCheck: is not Firefox
     * }
     *
     */
    tellSupported?: TellSupported;
    /**
     * if you set this to true, the `fallbackScriptSrc` you specified
     * will be appended to `strict-dynamic` also when `tellSupported` says "is supported"
     * This shifts the support decision to the browser.
     *
     * Defaults to `true`, as this is more lenient towards a "blacklisting"
     * approach of browser support, like the default `tellSupported` does.
     *
     * Set this to `false`, if you pass a detailled support specification with `tellSupported`
     *
     * @default true
     */
    inclusiveFallback?: boolean;
    extendScriptSrc?: boolean;
};
/**
 *
 * @param cfg A configuration object for a strict Content Security Policy (CSP)
 * @see https://web.dev/strict-csp/
 *
 * @returns
 * a middleware that provides an augmented strict CSP. It will ensure to include hashes of scripts for static routes (`getStaticProps` - Hash-based strict CSP)
 * or a nonce for dynamic routes (`getServerSideProps` - Nonce-based strict CSP).
 *
 * @requires `@next-safe/middleware/dist/document`
 *
 * Must be used together with `getCspInitialProps` and `provideComponents`
 * in `pages/_document.js` to wire stuff up with Next.js page prerendering.
 *
 * @example
 * import {
 *   chainMatch,
 *   isPageRequest,
 *   csp,
 *   strictDynamic,
 * } from "@next-safe/middleware";
 *
 *  const securityMiddleware = [
 *    csp(),
 *    strictDynamic(),
 *  ];
 *
 * export default chainMatch(isPageRequest)(...securityMiddleware);
 *
 */
declare const strictDynamic: (cfg?: MiddlewareConfig<StrictDynamicCfg>) => ChainableMiddleware;

declare type StrictInlineStylesCfg = {};
/**
 * @param cfg a configuration object for strict inline styles within a Content Security Policy (CSP)
 *
 * @returns a middleware that provides an augmented CSP with strict inline styles.
 * It will ensure to all style hashes (elem and attr) in the CSP that could be picked up during prerendering
 *
 * @requires `@next-safe/middleware/dist/document`
 *
 * Must be used together with `getCspInitialProps` and `provideComponents` in `pages/_document.js`
 * to wire stuff up with Next.js page prerendering. Additionally, you must pass
 * `{ trustifyStyles: true }` to `getCspInitialProps`.
 *
 * @example
 * import {
 *   chainMatch,
 *   isPageRequest,
 *   csp,
 *   strictDynamic,
 *   strictInlineStyles,
 * } from "@next-safe/middleware";
 *
 * const securityMiddleware = [
 *   csp(),
 *   strictDynamic(),
 *   strictInlineStyles(),
 * ];
 *
 * export default chainMatch(isPageRequest)(...securityMiddleware);
 */
declare const strictInlineStyles: (cfg?: MiddlewareConfig<StrictInlineStylesCfg>) => ChainableMiddleware;

declare type CspCfg = {
    /**
     * The directives that make up the base CSP configration.
     *
     * Typing is borrowed from SvelteKit CSP integration
     * @see https://kit.svelte.dev/docs/types#additional-types-cspdirectives
     *
     * @default
     * {
     *   "default-src": ["self"],
     *   "object-src": ["none"],
     *   "base-uri": ["none"],
     * }
     *
     */
    directives?: CspDirectives;
    /**
     * set to `true` to flag a `next dev` build.
     * Will append some directives to make the CSP work with the development server
     *
     * @default process.env.NODE_ENV === 'development'
     *
     */
    isDev?: boolean;
    /**
     * set to `true` to activate CSP report-only mode.
     * In this mode, violations will be reported, but the CSP is not enforced
     * and can't break your app (but also not protect it).
     *
     * It's recommended to roll out your CSP in this mode first, with reporting set up
     * and switch to enforce mode once everything looks right. For easy reporting setup,
     * you can use the `reporting` middleware and API handler of this lib.
     *
     * @see https://web.dev/strict-csp/#step-2:-set-a-strict-csp-and-prepare-your-scripts
     *
     * It's most convienient to control this option with an env var flag. This is also the default behavior of this option
     * (checks if `process.env.CSP_REPORT_ONLY` is set). Set this flag to an arbitrary value to enable report-only or
     * unset for enforce mode. If you use this flag, you don't need this option.
     *
     * All middleware of this lib that manipulates CSP will respect and conserve an existing reporting/enforce mode setting.
     *
     * @default !!process.env.CSP_REPORT_ONLY
     */
    reportOnly?: boolean;
};
/**
 * @param cfg base configuration for a Content Security Policy (CSP)
 * @returns a middleware the applies the configured CSP to response headers
 *
 * For setting up a strict CSP or strict inline styles, you need to chain additional middleware
 * (`strictDynamic`, `strictInlineStyles`) that does more complex stuff.
 *
 * Comes with rich typing and is resistant towards the "I forgot the fucking single quotes again" problem.
 *
 * You can use it together with the `nextSafe` middleware to set security headers other than CSP
 * @see https://trezy.gitbook.io/next-safe/usage/configuration
 *
 * @example
 * import {
 *   chainMatch,
 *   isPageRequest,
 *   csp,
 *   nextSafe,
 *   strictDynamic,
 *   strictInlineStyles,
 * } from "@next-safe/middleware";
 *
 * const securityMiddleware = [
 *   nextSafe({ disableCsp: true }),
 *   csp({
 *     directives: {
 *       "frame-src": ["self"],
 *       "img-src": ["self", "data:", "https://images.unsplash.com"],
 *       "font-src": ["self", "https://fonts.gstatic.com"],
 *     }
 *   }),
 *   strictDynamic(),
 *  ];
 *
 * export default chainMatch(isPageRequest)(...securityMiddleware);
 *
 */
declare const csp: (cfg?: MiddlewareConfig<CspCfg>) => ChainableMiddleware;

declare type TelemetryCfg = {
    middlewares: (ChainableMiddleware | Promise<ChainableMiddleware>)[];
    profileLabel?: string;
    logHeaders?: boolean;
    logExecutionTime?: boolean;
    logUrl?: boolean;
};
declare const telemetry: (cfg?: MiddlewareConfig<TelemetryCfg>) => ChainableMiddleware;

/**
 * @deprecated use the `strictDynamic` middleware builder to configure a strict CSP.
 */
declare const provideHashesOrNonce: ChainableMiddleware;

export { ChainFinalizer, ChainMatcher, ChainableMiddleware, CspCfg, Middleware, MiddlewareChain, MiddlewareChainContext, NextMiddlewareResult, NextRequestPredicate, NextSafeCfg, ReportingCfg, StrictDynamicCfg, StrictInlineStylesCfg, TelemetryCfg, chain, chainMatch, chainableMiddleware, continued, csp, isNextJsDataRequest, isPagePathRequest, isPageRequest, isPreviewModeRequest, matchAnd, matchNot, matchOr, memoize, memoizeInChain, memoizeResponseHeader, nextSafeMiddleware as nextSafe, provideHashesOrNonce, reporting, strictDynamic, strictInlineStyles, telemetry };
