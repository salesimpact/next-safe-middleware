import { NextApiRequest, NextApiHandler } from 'next';

declare type ReportToSerializedBase = {
    age: number;
    url: string;
    user_agent: string;
};
/**
 * @see https://w3c.github.io/webappsec-csp/#csp-violation-report
 */
declare type CSPViolationReportBody = {
    documentURL: string;
    referrer?: string;
    blockedURL?: string;
    effectiveDirective: string;
    originalPolicy: string;
    sourceFile?: string;
    sample?: string;
    disposition: "enforce" | "report";
    lineNumber?: number;
    statusCode?: number;
};
declare type ReportToCspViolation = {
    type: "csp-violation";
    /**
     * @see https://w3c.github.io/webappsec-csp/#csp-violation-report
     */
    body: CSPViolationReportBody;
};
declare type ReportToSerialized<AdditionalReportToTypes = never> = ReportToSerializedBase & (ReportToCspViolation | AdditionalReportToTypes);
/**
 * the data shape of that payload that browsers send to endpoints of Report-To headers
 * @see https://w3c.github.io/reporting/#serialize-reports
 * @see https://developers.google.com/web/updates/2018/09/reportingapi#reportypes
 * @see https://developers.google.com/web/updates/2018/09/reportingapi#debug
 *
 */
declare type ReportToPayload<AdditionalFormats = never> = ReportToSerialized<AdditionalFormats>[];
/**
 * the data shape of CSP violation reports for the `report-uri` directive
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
 * @see https://w3c.github.io/webappsec-csp/#deprecated-serialize-violation
 *
 */
declare type CspReport = {
    "blocked-uri": string;
    "column-number": number;
    "document-uri": string;
    "line-number": number;
    "original-policy": string;
    referrer: string;
    "script-sample": string;
    "source-file": string;
    "violated-directive": string;
};
/**
 * the data shape of the payload that browsers send to endpoints of CSP `report-uri` directive
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
 * @see https://w3c.github.io/webappsec-csp/#deprecated-serialize-violation
 *
 */
declare type CspReportUriPayload = {
    "csp-report": CspReport;
};
declare type PayloadKindReportTo = {
    kind: "report-to";
    /**
     * the data shape of that payload that browsers send to endpoints of `Report-To` headers
     * @see https://w3c.github.io/reporting/#serialize-reports
     * @see https://developers.google.com/web/updates/2018/09/reportingapi#reportypes
     * @see https://developers.google.com/web/updates/2018/09/reportingapi#debug
     *
     */
    payload: ReportToPayload;
};
declare type PayloadKindCspReportUri = {
    kind: "csp-report-uri";
    /**
     * the data shape of the payload that browsers send to endpoints of CSP `report-uri` directive
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
     * @see https://w3c.github.io/webappsec-csp/#deprecated-serialize-violation
     *
     */
    payload: CspReportUriPayload;
};
/**
 * Union shape for all kinds of reporting data
 * @see https://w3c.github.io/reporting/#serialize-reports
 * @see https://developers.google.com/web/updates/2018/09/reportingapi#reportypes
 * @see https://developers.google.com/web/updates/2018/09/reportingapi#debug
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
 * @see https://w3c.github.io/webappsec-csp/#deprecated-serialize-violation
 *
 */
declare type ReportingData = PayloadKindReportTo | PayloadKindCspReportUri;
/**
 * Function that processes reporting data sent to Next function endpoints
 */
declare type Reporter = (data: ReportingData, req: NextApiRequest) => Promise<void> | void;

/**
 *
 * @param sentryCspEndpoint
 * the CSP endpoint of your Sentry project.
 * @see https://docs.sentry.io/product/security-policy-reporting/ - Has convenient copy+paste function
 * @returns
 * a reporter function compatible with reporting API handler. Ingests CSP violation reports
 * of both directives (`report-to`, `report-uri`) into your Sentry project.
 *
 * @example
 * // pages/api/reporting.js
 * import {
 *   reporting,
 *   sentryCspReporterForEndpoint
 * } from '@next-safe/middleware/dist/api';
 *
 * const sentryCspEndpoint = process.env.SENTRY_CSP_ENDPOINT;
 * const sentryCspReporter = sentryCspReporterForEndpoint(sentryCspEndpoint!);
 *
 * export default reporting(sentryCspReporter)
 */
declare const sentryCspReporterForEndpoint: (sentryCspEndpoint: string) => Reporter;

/**
 * @param reporters
 * argument list of functions that process reporting data
 * (log to console, send to logging service, etc.)
 * @returns
 * a `NextApiHandler` that processes all incoming reporting data
 * as specified by the passed reporter functions.
 */
declare const reportingApiHandler: (...reporters: Reporter[]) => NextApiHandler;

export { CspReportUriPayload, ReportToPayload, Reporter, ReportingData, reportingApiHandler as reporting, sentryCspReporterForEndpoint };
