import { NextPageContext, PreviewData, GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { Head as Head$2, NextScript as NextScript$2, DocumentProps, DocumentContext, DocumentInitialProps } from 'next/document';
import { CspBuilder, HashAlgorithm, HashWithAlgorithm } from '@strict-csp/builder';

declare const logCtxHeaders: (ctx: NextPageContext, excludeLongHeaders?: boolean) => void;

declare type CtxHeaders = Pick<NextPageContext, "req" | "res">;

declare const getCtxCsp: (ctx: CtxHeaders) => CspBuilder;
declare const setCtxCsp: (ctx: CtxHeaders, builder: CspBuilder) => void;

declare const setNonceBits: (bits: number) => number;
declare const generateNonce: (bits?: number) => string;
declare const getCtxNonce: (ctx: CtxHeaders) => string;
declare const getCreateCtxNonceIdempotent: (ctx: CtxHeaders) => string;

declare function gsspWithNonce<P extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, Q extends ParsedUrlQuery = ParsedUrlQuery, D extends PreviewData = PreviewData>(getServerSideProps: GetServerSideProps<P, Q, D>): GetServerSideProps<P & {
    nonce: string;
}, Q, D>;
declare function gipWithNonce<Props extends Record<string, any> = Record<string, any>>(getInitialProps: (ctx: NextPageContext) => Promise<Props>): (ctx: NextPageContext) => Promise<Props & {
    nonce: string;
}>;
/**
 * @alias gsspWithNonce
 */
declare const gsspWithNonceAppliedToCsp: typeof gsspWithNonce;
/**
 * @alias gipWithNonce
 */
declare const gipWithNonceAppliedToCsp: typeof gipWithNonce;

declare type ExcludeList = ("scripts" | "styles")[];
declare type TrustifyComponentProps = {
    children?: any;
};
declare type TrustifyComponents = {
    Head: (props: TrustifyComponentProps) => any;
    NextScript: (props: TrustifyComponentProps) => any;
};

declare const setHashAlgorithm: (algorithm: HashAlgorithm) => HashAlgorithm;
declare const hash: (text: string) => `sha256-${string}` | `sha384-${string}` | `sha512-${string}`;

declare type CspManifest = {
    scripts: {
        src?: string;
        hash: HashWithAlgorithm;
    }[];
    styles: {
        elem: HashWithAlgorithm[];
        attr: HashWithAlgorithm[];
    };
};

declare type Nullable<T = null> = T | null;
declare type Primitive = string | number | boolean;
declare type IterableScript = [string, Primitive][];

declare let iterableScripts: IterableScript[];
declare const collectIterableScript: (...scripts: Nullable<IterableScript>[]) => void;
declare const collectScriptElement: (...scripts: Nullable<JSX.Element>[]) => void;
declare const pullManifestScripts: () => ({
    src: string;
    hash: `sha256-${string}` | `sha384-${string}` | `sha512-${string}`;
} | {
    hash: `sha256-${string}` | `sha384-${string}` | `sha512-${string}`;
    src?: undefined;
})[];
declare const collectStyleElem: (...hashes: HashWithAlgorithm[]) => void;
declare const pullStyleElem: () => HashWithAlgorithm[];
declare const collectStyleAttr: (...hashes: HashWithAlgorithm[]) => void;
declare const pullStyleAttr: () => (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[];
declare const pullManifest: () => CspManifest;

declare const sameLengthPaddedFlatZip: (a: any, b: any) => any[];
declare const deepMapExtractScripts: (children: any) => any[];
declare const deepMapStripIntegrity: (children: any) => any[];
declare const deepExtractStyleElemHashes: (children: any, exclude?: ExcludeList) => HashWithAlgorithm[];

declare const deepEnsureScriptElementsInManifest: (children: any, component?: "Head") => void;

declare class Head$1 extends Head$2 {
    private proxyfiedScripts;
    getPreloadDynamicChunks(): JSX.Element[];
    getPreloadMainLinks(files: any): any;
    getBeforeInteractiveInlineScripts(): any;
    getPolyfillScripts(): any;
    getPreNextScripts(): any;
    getDynamicChunks(files: any): any;
    getScripts(files: any): any;
    render(): JSX.Element;
}

declare class NextScript$1 extends NextScript$2 {
    private proxyfiedScripts;
    getPolyfillScripts(): any;
    getPreNextScripts(): any;
    getDynamicChunks(files: any): any;
    getScripts(files: any): any;
}

declare const deepEnsureNonceInChildren: (nonce: string, children: any, exclude?: ("scripts" | "styles")[]) => void;
declare const deepMapWithNonce: (nonce: string, children: any, exclude?: ("scripts" | "styles")[]) => JSX.Element[];

declare class Head extends Head$2 {
    getPreNextScripts(): any;
    render(): JSX.Element;
}

declare class NextScript extends NextScript$2 {
    getPreNextScripts(): any;
}

/**
 * Provides replacement components for `<Head>` and `<NextScript>` from `next/document`.
 * They do all kinds of different stuff so strict CSPs work with Next.js.
 *
 * `getCspInitialProps` must be called in `getInitialProps` of your custom `_document.js` for them to work.
 *
 * @requires `getCspInitialProps`
 *
 * @example
 * export default class MyDocument extends Document {
 *   static async getInitialProps(ctx) {
 *     const initialProps = await getCspInitialProps({
 *       ctx,
 *       trustifyStyles: true,
 *     });
 *     return initialProps;
 *   ...
 *
 *   render() {
 *     const { Head, NextScript } = provideComponents(this.props)
 *     ...
 *   }
 */
declare const provideComponents: (props: DocumentProps) => TrustifyComponents;

declare type ProcessHtmlOptions = {
    styles?: boolean | {
        elements?: boolean;
        attributes?: boolean;
    };
};
declare type CspDocumentInitialPropsOptions = {
    /** the context of the document, same as passed to `Document.getInitialProps` */
    ctx: DocumentContext;
    /**
     * if you call `Document.getInitialProps` yourself and want to do more customizations
     * on initialProps before, do them and pass the result here  */
    passInitialProps?: DocumentInitialProps;
    /**
     * You need to set this to `true`, if you want strict inline styles and use the `strictInlineStyles` middleware.
     * If you do so, styles (tags and attributes) of prerendered HTML
     * will be visited and nonced/hashed for CSP.
     *
     * @default false
     *
     * @see https://github.com/nibtime/next-safe-middleware/issues/31
     */
    trustifyStyles?: boolean;
    /**
     * This needs to be `true` if you use a strict CSP with `strictDynamic` middleware.
     * This will ensure that all your scripts that need to load before your app
     * is interactive (including Next itself) get nonced/hashed and included in your CSP.
     *
     * @default true
     */
    trustifyScripts?: boolean;
    /**
     * you can pass raw css of style tags here to be hashed. This is necessary if a framework adds
     * style tags in an opaque way with a React component, like Mantine. In such cases you can pass
     * the raw css text of the underlying CSS-in-JS framework here.
     *
     * values can be a string with raw css text
     * or a function that pull a string with css text from `initialProps`
     * (if you want an enhanced <App> with nonce, you can't call Document.getInitialProps before);
     *
     * @see https://github.com/nibtime/next-safe-middleware/issues/34
     *
     * @example
     * const initialProps = await getCspInitialProps({
     *   ctx,
     *   trustifyStyles: true,
     *   hashStyleElements: [
     *     (initialProps) =>
     *       stylesServer
     *         .extractCriticalToChunks(initialProps.html)
     *         .styles.map((s) => s.css),
     *   ],
     * });
     * ...
     *
     * return initialProps
     */
    hashRawCss?: (string | ((initialProps: DocumentInitialProps) => string | string[]))[];
    /**
     * To control whether to trustify stuff in initialProps.html
     *
     * This can be potentially dangerous if you server-render dynamic user data from `getStaticProps` or `getServerSideProps`
     * in HTML. However if you turn it off, every inline style of every 3rd party lib (including even default Next.js 404) will
     * be blocked by CSP with the only alternative being `style-src unsafe-inline`.
     *
     * Can be turned completely on/off complete per directives with `trustify...` flags
     * and selectively for initialProps.html with granluar control via this config object
     * @default
     * {
     *   styles: {
     *     elements: true,
     *     attributes: true
     *   }
     * }
     */
    processHtmlOptions?: ProcessHtmlOptions;
    hashBasedByProxy?: boolean;
};
declare type CspDocumentInitialProps = DocumentInitialProps & {
    nonce?: string;
};

/**
 * A replacement for `Document.getInitialProps`to use in `getInitialProps` of your custom `_document.js` .
 * It sets up all different kinds of stuff so strict CSPs work with Next.js.
 *
 * Must be used together with components returned from `provideComponents` to be in effect.
 * @requires `provideComponents`
 *
 * @example
 * export default class MyDocument extends Document {
 *   static async getInitialProps(ctx) {
 *     const initialProps = await getCspInitialProps({
 *       ctx,
 *       trustifyStyles: true,
 *       enhanceAppWithNonce: true
 *     });
 *     return initialProps;
 * ...
 */
declare const getCspInitialProps: ({ ctx, passInitialProps, trustifyScripts, trustifyStyles, hashRawCss, processHtmlOptions, hashBasedByProxy, }: CspDocumentInitialPropsOptions) => Promise<CspDocumentInitialProps>;

export { CspDocumentInitialProps, CspDocumentInitialPropsOptions, Head$1 as HashHead, NextScript$1 as HashNextScript, Head as NonceHead, NextScript as NonceNextScript, ProcessHtmlOptions, collectIterableScript, collectScriptElement, collectStyleAttr, collectStyleElem, deepEnsureNonceInChildren, deepEnsureScriptElementsInManifest, deepExtractStyleElemHashes, deepMapExtractScripts, deepMapStripIntegrity, deepMapWithNonce, generateNonce, getCreateCtxNonceIdempotent, getCspInitialProps, getCtxCsp, getCtxNonce, gipWithNonce, gipWithNonceAppliedToCsp, gsspWithNonce, gsspWithNonceAppliedToCsp, hash, iterableScripts, logCtxHeaders, provideComponents, pullManifest, pullManifestScripts, pullStyleAttr, pullStyleElem, sameLengthPaddedFlatZip, setCtxCsp, setHashAlgorithm, setNonceBits };
