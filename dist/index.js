'use strict';Object.defineProperty(exports,'__esModule',{value:true});var builder=require('@strict-csp/builder');var server=require('next/server');const memoizeInChain=(key,f)=>(...args)=>async ctx=>{const cached=ctx.cache.get(key);if(cached){return cached}const fetched=await f(...args);ctx.cache.set(key,fetched);return ctx.cache.get(key)};const memoize=f=>{let memoized;return async(...args)=>{if(memoized){return memoized}memoized=await f(...args);return memoized}};const memoizeResponseHeader=(header,fromHeaderValue,toHeaderValue,merger)=>{const writeHeaderCallback=(req,evt,ctx)=>{const cached=ctx.cache.get(header);if(cached){const resHeaders=ctx.res.get().headers;const headerValue=toHeaderValue(cached);if(headerValue){resHeaders.set(header,headerValue)}}};return ctx=>{ctx.finalize.addCallback(writeHeaderCallback);const fromCacheOrRes=()=>{const fromCache=ctx.cache.get(header);if(fromCache){return fromCache}const resHeaders=ctx.res.get().headers;const value=resHeaders.get(header)||"";return fromHeaderValue(value)};const set=value=>{const fromCache=ctx.cache.get(header);if(!fromCache||!merger){ctx.cache.set(header,value);return}ctx.cache.set(header,merger(fromCache,value))};const value1=fromCacheOrRes();return[value1,set]}};const matchNot=matcher=>req=>!matcher(req);const matchAnd=(...matchers)=>req=>{let matches=true;for(const matcher of matchers){matches=matcher(req);if(!matches)return matches}return matches};const matchOr=(...matchers)=>req=>{let matches=false;for(const matcher of matchers){matches=matcher(req);if(matches)return matches}return matches};const isPagePathRequest=req=>{const isNonPagePathPrefix=/^\/(?:_next|api)\//;const isFile=/\..*$/;const{pathname}=req.nextUrl;return!isNonPagePathPrefix.test(pathname)&&!isFile.test(pathname)};const isPreviewModeRequest=req=>!!req.cookies.get("__next_preview_data");const isNextJsDataRequest=req=>!!req.headers.get("x-nextjs-data");const isPageRequest=matchAnd(isPagePathRequest,matchNot(isPreviewModeRequest),matchNot(isNextJsDataRequest));const deepFreeze=obj=>{Object.keys(obj).forEach(prop=>{if(typeof obj[prop]==="object")deepFreeze(obj[prop])});return Object.freeze(obj)};const chain=(...middlewares)=>async(req,evt)=>{let chainResponse;const cache={};const finalizers=[];const ctx=deepFreeze({res:{get:()=>{if(!chainResponse){chainResponse=server.NextResponse.next()}return chainResponse},set:res=>chainResponse=res},cache:{get:k=>cache[k],set:(k,v)=>cache[k]=v},finalize:{addCallback:f=>{if(!finalizers.includes(f)){finalizers.push(f)}}}});const finalize1=async()=>{try{return Promise.all(finalizers.map(finalize=>finalize(req,evt,ctx)))}catch(error){console.error("[chain]: finalization error",{error})}};for await(const middleware of middlewares){const mwRes=await middleware(req,evt,ctx);if(mwRes){return mwRes}}await finalize1();return chainResponse};const chainMatch=matcher=>(...middlewares)=>async(req,evt)=>{if(matcher(req)){return chain(...middlewares)(req,evt)}};const chainableMiddleware=middleware=>{return async(req,evt,ctx)=>{if(ctx){return middleware(req,evt,ctx)}return chain(middleware)(req,evt)}};const continued=nextMiddleware=>chainableMiddleware(async(req,evt,ctx)=>{const mwRes=await nextMiddleware(req,evt);if(mwRes){ctx.res.set(mwRes)}});var crunchHeaderValue$1=function crunchHeaderValue(headerValue){return Object.entries(headerValue).reduce((accumulator,[key,value])=>{let serializedValue=value;if(!Array.isArray(value)){serializedValue=[value]}return`${accumulator}${key} ${serializedValue.join(' ')};`},'')};const crunchHeaderValue=crunchHeaderValue$1;const devDirectives={'connect-src':['webpack://*'],'script-src':["'unsafe-eval'"],'style-src':["'unsafe-inline'"]};function getCSPDirective(value,defaultValue){return[value||defaultValue].flat()}var buildCSPHeaders$1=function buildCSPHeaders(options={}){const{contentSecurityPolicy={},isDev}=options;if(contentSecurityPolicy===false){return[]}const directives1={'base-uri':getCSPDirective(contentSecurityPolicy['base-uri'],"'none'"),'child-src':getCSPDirective(contentSecurityPolicy['child-src'],"'none'"),'connect-src':getCSPDirective(contentSecurityPolicy['connect-src'],"'self'"),'default-src':getCSPDirective(contentSecurityPolicy['default-src'],"'self'"),'font-src':getCSPDirective(contentSecurityPolicy['font-src'],"'self'"),'form-action':getCSPDirective(contentSecurityPolicy['form-action'],"'self'"),'frame-ancestors':getCSPDirective(contentSecurityPolicy['frame-ancestors'],"'none'"),'frame-src':getCSPDirective(contentSecurityPolicy['frame-src'],"'none'"),'img-src':getCSPDirective(contentSecurityPolicy['img-src'],"'self'"),'manifest-src':getCSPDirective(contentSecurityPolicy['manifest-src'],"'self'"),'media-src':getCSPDirective(contentSecurityPolicy['media-src'],"'self'"),'object-src':getCSPDirective(contentSecurityPolicy['object-src'],"'none'"),'prefetch-src':getCSPDirective(contentSecurityPolicy['prefetch-src'],"'self'"),'script-src':getCSPDirective(contentSecurityPolicy['script-src'],"'self'"),'style-src':getCSPDirective(contentSecurityPolicy['style-src'],"'self'"),'worker-src':getCSPDirective(contentSecurityPolicy['worker-src'],"'self'")};const optionalDirectives=['block-all-mixed-content','plugin-types','navigate-to','require-sri-for','require-trusted-types-for','sandbox','script-src-attr','script-src-elem','style-src-attr','style-src-elem','trusted-types','upgrade-insecure-requests',];optionalDirectives.forEach(optionalDirective=>{if(contentSecurityPolicy[optionalDirective]){directives1[optionalDirective]=getCSPDirective(contentSecurityPolicy[optionalDirective])}});if(contentSecurityPolicy['report-to']||contentSecurityPolicy['report-uri']){const reportDirectiveValue=getCSPDirective(contentSecurityPolicy['report-to']||contentSecurityPolicy['report-uri']);directives1['report-uri']=reportDirectiveValue;directives1['report-to']=reportDirectiveValue}Object.entries(contentSecurityPolicy).forEach(([key,value])=>{if(value===false){delete directives1[key]}});if(isDev){Object.entries(devDirectives).forEach(([key,value])=>{if(directives1[key]){directives1[key]=directives1[key].concat(value)}else{directives1[key]=[...value]}})}const cspString=crunchHeaderValue(directives1);const cspHeaderNames=[`Content-Security-Policy${contentSecurityPolicy.reportOnly?'-Report-Only':''}`,`X-Content-Security-Policy${contentSecurityPolicy.reportOnly?'-Report-Only':''}`,'X-WebKit-CSP',];return cspHeaderNames.map(headerName=>({key:headerName,value:cspString}))};var crunchFeaturePolicyHeader$1=function crunchFeaturePolicyHeader(headerValue){return Object.entries(headerValue).reduce((accumulator,[key,value])=>{let serializedValue=value;if(!Array.isArray(value)){serializedValue=[value]}return`${accumulator}${key} ${serializedValue.join(' ')};`},'')};var crunchPermissionsPolicyHeader$1=function crunchPermissionsPolicyHeader(headerValue){return Object.entries(headerValue).reduce((accumulator,[key,value])=>{let serializedValue=value;if(!Array.isArray(value)){serializedValue=value.split(' ')}serializedValue=serializedValue.map(item=>{if(item.includes('*')){return'*'}if(item==="'self'"){return'self'}if(!['*','self'].includes(item)&&!/^['"].*['"]$/){return item.replace(/^['"]/,'"').replace(/['"]$/,'"')}return item});accumulator.push(`${key}=(${serializedValue.join(' ')})`);return accumulator},[]).join(',')};var experimentalDirectives$1=['conversion-measurement','focus-without-user-activation','hid','idle-detection','serial','sync-script','trust-token-redemption','vertical-scroll',];var legacyDirectives$1=['animations','document-write','image-compression','layout-animations','legacy-image-formats','max-downscaling-image','notifications','oversized-images','push','speaker','unsized-media','vibrate','vr','wake-lock','webauthn','web-share',];var proposedDirectives$1=['clipboard-read','clipboard-write','gamepad','speaker-selection',];var standardDirectives$1=['accelerometer','ambient-light-sensor','autoplay','battery','camera','cross-origin-isolated','display-capture','document-domain','encrypted-media','execution-while-not-rendered','execution-while-out-of-viewport','fullscreen','geolocation','gyroscope','magnetometer','microphone','midi','navigation-override','payment','picture-in-picture','publickey-credentials-get','screen-wake-lock','sync-xhr','usb','web-share','xr-spatial-tracking',];const experimentalDirectives=experimentalDirectives$1;const legacyDirectives=legacyDirectives$1;const proposedDirectives=proposedDirectives$1;const standardDirectives=standardDirectives$1;var PermissionsPolicy={experimental:experimentalDirectives,legacy:legacyDirectives,proposed:proposedDirectives,standard:standardDirectives};const crunchFeaturePolicyHeader=crunchFeaturePolicyHeader$1;const crunchPermissionsPolicyHeader=crunchPermissionsPolicyHeader$1;const directives=PermissionsPolicy;function reduceDirectives(supportedDirectives,permissionsPolicy,defaultValue){return supportedDirectives.reduce((accumulator,directive)=>{if(permissionsPolicy[directive]!==false){accumulator[directive]=permissionsPolicy[directive]||defaultValue}return accumulator},{})}var buildPermissionsPolicyHeaders$1=function buildPermissionsPolicyHeaders(options={}){const{permissionsPolicy={},permissionsPolicyDirectiveSupport=['proposed','standard']}=options;if(permissionsPolicy===false){return[]}const supportedDirectives=Array.from(new Set(permissionsPolicyDirectiveSupport.map(directiveSet=>directives[directiveSet]).flat()));return[{key:'Feature-Policy',value:crunchFeaturePolicyHeader(reduceDirectives(supportedDirectives,permissionsPolicy,"'none'"))},{key:'Permissions-Policy',value:crunchPermissionsPolicyHeader(reduceDirectives(supportedDirectives,permissionsPolicy,''))},]};const buildCSPHeaders=buildCSPHeaders$1;const buildPermissionsPolicyHeaders=buildPermissionsPolicyHeaders$1;function makeHeaderObj(key,value,defaultValue){if(key===false){return undefined}return{key,value:value||defaultValue}}function nextSafe$2(options={}){const{contentTypeOptions,contentSecurityPolicy={},frameOptions,permissionsPolicy={},permissionsPolicyDirectiveSupport,isDev=false,referrerPolicy,xssProtection}=options;return[...buildCSPHeaders({contentSecurityPolicy,isDev}),...buildPermissionsPolicyHeaders({permissionsPolicy,permissionsPolicyDirectiveSupport,isDev}),makeHeaderObj('Referrer-Policy',referrerPolicy,'no-referrer'),makeHeaderObj('X-Content-Type-Options',contentTypeOptions,'nosniff'),makeHeaderObj('X-Frame-Options',frameOptions,'DENY'),makeHeaderObj('X-XSS-Protection',xssProtection,'1; mode=block'),].filter(header=>Boolean(header))}var nextSafe_1=nextSafe$2;const nextSafe$1=nextSafe_1;var lib=nextSafe$1;function _isPlaceholder(a){return a!=null&& typeof a==='object'&&a['@@functional/placeholder']===true}function _curry1(fn){return function f1(a){if(arguments.length===0||_isPlaceholder(a)){return f1}else{return fn.apply(this,arguments)}}}function _curry2(fn){return function f2(a,b){switch(arguments.length){case 0:return f2;case 1:return _isPlaceholder(a)?f2:_curry1(function(_b){return fn(a,_b)});default:return _isPlaceholder(a)&&_isPlaceholder(b)?f2:_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b)}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b)}):fn(a,b)}}}function _curry3(fn){return function f3(a,b,c){switch(arguments.length){case 0:return f3;case 1:return _isPlaceholder(a)?f3:_curry2(function(_b,_c){return fn(a,_b,_c)});case 2:return _isPlaceholder(a)&&_isPlaceholder(b)?f3:_isPlaceholder(a)?_curry2(function(_a,_c){return fn(_a,b,_c)}):_isPlaceholder(b)?_curry2(function(_b,_c){return fn(a,_b,_c)}):_curry1(function(_c){return fn(a,b,_c)});default:return _isPlaceholder(a)&&_isPlaceholder(b)&&_isPlaceholder(c)?f3:_isPlaceholder(a)&&_isPlaceholder(b)?_curry2(function(_a,_b){return fn(_a,_b,c)}):_isPlaceholder(a)&&_isPlaceholder(c)?_curry2(function(_a,_c){return fn(_a,b,_c)}):_isPlaceholder(b)&&_isPlaceholder(c)?_curry2(function(_b,_c){return fn(a,_b,_c)}):_isPlaceholder(a)?_curry1(function(_a){return fn(_a,b,c)}):_isPlaceholder(b)?_curry1(function(_b){return fn(a,_b,c)}):_isPlaceholder(c)?_curry1(function(_c){return fn(a,b,_c)}):fn(a,b,c)}}}function _has(prop,obj){return Object.prototype.hasOwnProperty.call(obj,prop)}function _includesWith(pred,x,list){var idx=0;var len=list.length;while(idx<len){if(pred(x,list[idx])){return true}idx+=1}return false}function _isObject(x){return Object.prototype.toString.call(x)==='[object Object]'}var differenceWith=_curry3(function differenceWith(pred,first,second){var out=[];var idx=0;var firstLen=first.length;while(idx<firstLen){if(!_includesWith(pred,first[idx],second)&&!_includesWith(pred,first[idx],out)){out.push(first[idx])}idx+=1}return out});var differenceWith$1=differenceWith;function _objectAssign(target){if(target==null){throw new TypeError('Cannot convert undefined or null to object')}var output=Object(target);var idx=1;var length=arguments.length;while(idx<length){var source=arguments[idx];if(source!=null){for(var nextKey in source){if(_has(nextKey,source)){output[nextKey]=source[nextKey]}}}idx+=1}return output}var _objectAssign$1=typeof Object.assign==='function'?Object.assign:_objectAssign;var mergeWithKey=_curry3(function mergeWithKey(fn,l,r){var result={};var k;for(k in l){if(_has(k,l)){result[k]=_has(k,r)?fn(k,l[k],r[k]):l[k]}}for(k in r){if(_has(k,r)&&!_has(k,result)){result[k]=r[k]}}return result});var mergeDeepWithKey=_curry3(function mergeDeepWithKey1(fn,lObj,rObj){return mergeWithKey(function(k,lVal,rVal){if(_isObject(lVal)&&_isObject(rVal)){return mergeDeepWithKey1(fn,lVal,rVal)}else{return fn(k,lVal,rVal)}},lObj,rObj)});var mergeDeepWithKey$1=mergeDeepWithKey;var mergeRight=_curry2(function mergeRight(l,r){return _objectAssign$1({},l,r)});var mergeRight$1=mergeRight;const unpackConfig=async(cfg,req,evt,ctx)=>{const userAgent=server.userAgent({headers:req.headers});return typeof cfg==="function"?{...await cfg({req,evt,ctx,userAgent}),userAgent}:{userAgent,...cfg}};const mergeConfigs=(left,right,keyMerger=(k,l,r)=>r)=>async({req,evt,ctx})=>{const leftCfg=await unpackConfig(left,req,evt,ctx);const rightCfg=await unpackConfig(right,req,evt,ctx);return mergeDeepWithKey$1(keyMerger,leftCfg,rightCfg)};const isTrue=x=>typeof x==="boolean"&&x;const isFalse=x=>typeof x==="boolean"&&!x;const isNonBool=x=>typeof x!=="boolean"&&!!x;const defaultConfigMergers=[(k,l,r)=>isTrue(r)&&isNonBool(l)?l:undefined,(k,l,r)=>isFalse(r)&&isNonBool(l)?null:undefined,(k,l,r)=>r,];const chainMergers=mergers=>(k,l,r)=>mergers.reduce((v,next)=>typeof v==="undefined"?next(k,l,r):v,undefined);const withDefaultConfig=(builder1,defaultCfg,...keyMergers)=>cfg=>async(req,evt,ctx)=>{if(cfg){const unpackedCfg=await unpackConfig(cfg,req,evt,ctx);return builder1(mergeConfigs(typeof defaultCfg==="function"?defaultCfg(unpackedCfg):defaultCfg,unpackedCfg,chainMergers([...keyMergers,...defaultConfigMergers])))(req,evt,ctx)}else{return builder1(typeof defaultCfg==="function"?defaultCfg({}):defaultCfg)(req,evt,ctx)}};var retry$1={};function RetryOperation(timeouts,options){if(typeof options==='boolean'){options={forever:options}}this._originalTimeouts=JSON.parse(JSON.stringify(timeouts));this._timeouts=timeouts;this._options=options||{};this._maxRetryTime=options&&options.maxRetryTime||Infinity;this._fn=null;this._errors=[];this._attempts=1;this._operationTimeout=null;this._operationTimeoutCb=null;this._timeout=null;this._operationStart=null;this._timer=null;if(this._options.forever){this._cachedTimeouts=this._timeouts.slice(0)}}var retry_operation=RetryOperation;RetryOperation.prototype.reset=function(){this._attempts=1;this._timeouts=this._originalTimeouts.slice(0)};RetryOperation.prototype.stop=function(){if(this._timeout){clearTimeout(this._timeout)}if(this._timer){clearTimeout(this._timer)}this._timeouts=[];this._cachedTimeouts=null};RetryOperation.prototype.retry=function(err){if(this._timeout){clearTimeout(this._timeout)}if(!err){return false}var currentTime=new Date().getTime();if(err&&currentTime-this._operationStart>=this._maxRetryTime){this._errors.push(err);this._errors.unshift(new Error('RetryOperation timeout occurred'));return false}this._errors.push(err);var timeout=this._timeouts.shift();if(timeout===undefined){if(this._cachedTimeouts){this._errors.splice(0,this._errors.length-1);timeout=this._cachedTimeouts.slice(-1)}else{return false}}var self=this;this._timer=setTimeout(function(){self._attempts++;if(self._operationTimeoutCb){self._timeout=setTimeout(function(){self._operationTimeoutCb(self._attempts)},self._operationTimeout);if(self._options.unref){self._timeout.unref()}}self._fn(self._attempts)},timeout);if(this._options.unref){this._timer.unref()}return true};RetryOperation.prototype.attempt=function(fn,timeoutOps){this._fn=fn;if(timeoutOps){if(timeoutOps.timeout){this._operationTimeout=timeoutOps.timeout}if(timeoutOps.cb){this._operationTimeoutCb=timeoutOps.cb}}var self=this;if(this._operationTimeoutCb){this._timeout=setTimeout(function(){self._operationTimeoutCb()},self._operationTimeout)}this._operationStart=new Date().getTime();this._fn(this._attempts)};RetryOperation.prototype.try=function(fn){console.log('Using RetryOperation.try() is deprecated');this.attempt(fn)};RetryOperation.prototype.start=function(fn){console.log('Using RetryOperation.start() is deprecated');this.attempt(fn)};RetryOperation.prototype.start=RetryOperation.prototype.try;RetryOperation.prototype.errors=function(){return this._errors};RetryOperation.prototype.attempts=function(){return this._attempts};RetryOperation.prototype.mainError=function(){if(this._errors.length===0){return null}var counts={};var mainError=null;var mainErrorCount=0;for(var i=0;i<this._errors.length;i++){var error=this._errors[i];var message=error.message;var count=(counts[message]||0)+1;counts[message]=count;if(count>=mainErrorCount){mainError=error;mainErrorCount=count}}return mainError};(function(exports){var RetryOperation1=retry_operation;exports.operation=function(options){var timeouts=exports.timeouts(options);return new RetryOperation1(timeouts,{forever:options&&(options.forever||options.retries===Infinity),unref:options&&options.unref,maxRetryTime:options&&options.maxRetryTime})};exports.timeouts=function(options){if(options instanceof Array){return[].concat(options)}var opts={retries:10,factor:2,minTimeout:1*1e3,maxTimeout:Infinity,randomize:false};for(var key in options){opts[key]=options[key]}if(opts.minTimeout>opts.maxTimeout){throw new Error('minTimeout is greater than maxTimeout')}var timeouts=[];for(var i=0;i<opts.retries;i++){timeouts.push(this.createTimeout(i,opts))}if(options&&options.forever&&!timeouts.length){timeouts.push(this.createTimeout(i,opts))}timeouts.sort(function(a,b){return a-b});return timeouts};exports.createTimeout=function(attempt,opts){var random=opts.randomize?Math.random()+1:1;var timeout=Math.round(random*Math.max(opts.minTimeout,1)*Math.pow(opts.factor,attempt));timeout=Math.min(timeout,opts.maxTimeout);return timeout};exports.wrap=function(obj,options,methods){if(options instanceof Array){methods=options;options=null}if(!methods){methods=[];for(var key in obj){if(typeof obj[key]==='function'){methods.push(key)}}}for(var i=0;i<methods.length;i++){var method=methods[i];var original1=obj[method];obj[method]=(function retryWrapper(original){var op=exports.operation(options);var args=Array.prototype.slice.call(arguments,1);var callback=args.pop();args.push(function(err){if(op.retry(err)){return}if(err){arguments[0]=op.mainError()}callback.apply(this,arguments)});op.attempt(function(){original.apply(obj,args)})}).bind(obj,original1);obj[method].options=options}}})(retry$1);var retry=retry$1;const networkErrorMsgs=new Set(['Failed to fetch','NetworkError when attempting to fetch resource.','The Internet connection appears to be offline.','Network request failed']);class AbortError extends Error{constructor(message){super();if(message instanceof Error){this.originalError=message;({message}=message)}else{this.originalError=new Error(message);this.originalError.stack=this.stack}this.name='AbortError';this.message=message}}const decorateErrorWithCounts=(error,attemptNumber,options)=>{const retriesLeft=options.retries-(attemptNumber-1);error.attemptNumber=attemptNumber;error.retriesLeft=retriesLeft;return error};const isNetworkError=errorMessage=>networkErrorMsgs.has(errorMessage);const getDOMException=errorMessage=>globalThis.DOMException===undefined?new Error(errorMessage):new DOMException(errorMessage);async function pRetry(input,options){return new Promise((resolve,reject)=>{options={onFailedAttempt(){},retries:10,...options};const operation=retry.operation(options);operation.attempt(async attemptNumber=>{try{resolve(await input(attemptNumber))}catch(error){if(!(error instanceof Error)){reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));return}if(error instanceof AbortError){operation.stop();reject(error.originalError)}else if(error instanceof TypeError&&!isNetworkError(error.message)){operation.stop();reject(error)}else{decorateErrorWithCounts(error,attemptNumber,options);try{await options.onFailedAttempt(error)}catch(error1){reject(error1);return}if(!operation.retry(error)){reject(operation.mainError())}}}});if(options.signal&&!options.signal.aborted){options.signal.addEventListener('abort',()=>{operation.stop();const reason=options.signal.reason===undefined?getDOMException('The operation was aborted.'):options.signal.reason;reject(reason instanceof Error?reason:getDOMException(reason))},{once:true})}})}const CSP_LOCATION_MIDDLEWARE='_next/static/~csp';const CSP_MANIFEST_FILENAME='csp-manifest.json';const CSP_HEADER='content-security-policy';const CSP_HEADER_REPORT_ONLY='content-security-policy-report-only';const cspBuilderFromCtx=ctx=>{const headers=ctx.res.get().headers;const cspContent=headers.get(CSP_HEADER);const cspContentReportOnly=headers.get(CSP_HEADER_REPORT_ONLY);if(cspContent){return new builder.CspBuilder([CSP_HEADER,cspContent])}if(cspContentReportOnly){return new builder.CspBuilder([CSP_HEADER_REPORT_ONLY,cspContentReportOnly])}return new builder.CspBuilder()};const memoizedCspBuilder=memoizeInChain("csp-builder",cspBuilderFromCtx);const builderToResponse=async(_req,_evt,ctx)=>{const builder2=ctx.cache.get("csp-builder");if(!builder2.isEmpty()){const headers=ctx.res.get().headers;headers.delete(CSP_HEADER);headers.delete(CSP_HEADER_REPORT_ONLY);headers.set(...builder2.toHeaderKeyValue())}};const cachedCspBuilder=async ctx=>{ctx.finalize.addCallback(builderToResponse);return memoizedCspBuilder(ctx)(ctx)};const fetchCspManifest=async req=>{const{origin,basePath}=req.nextUrl;const baseUrl=basePath?`${origin}${basePath}/${CSP_LOCATION_MIDDLEWARE}`:`${origin}/${CSP_LOCATION_MIDDLEWARE}`;const manifestUrl=encodeURI(`${baseUrl}/${CSP_MANIFEST_FILENAME}`);const res=await fetch(manifestUrl);return res.json()};const fetchCspManifestWithRetry=(req,retries=5)=>pRetry(async()=>{if(process.env.NODE_ENV==="development"){return undefined}const result=await fetchCspManifest(req);return result},{retries});const cachedCspManifest=memoize(fetchCspManifestWithRetry);const nextSafe=lib;const _nextSafeMiddleware=cfg=>chainableMiddleware(async(req,evt,ctx)=>{const cspBuilder=await cachedCspBuilder(ctx);const config=await unpackConfig(cfg,req,evt,ctx);const{disableCsp,userAgent,...nextSafeCfg}=config;const isNoCspSecurityHeader=header=>!header.key.toLowerCase().includes(CSP_HEADER)&&!header.key.toLowerCase().includes("csp");nextSafe(nextSafeCfg).forEach(header=>{if(isNoCspSecurityHeader(header)){ctx.res.get().headers.set(header.key,header.value)}});if(disableCsp||nextSafeCfg.contentSecurityPolicy===false){return}const{reportOnly,...directives2}=nextSafeCfg.contentSecurityPolicy;cspBuilder.withDirectives(directives2).withReportOnly(reportOnly)});const nextSafeMiddleware=withDefaultConfig(_nextSafeMiddleware,{isDev:process.env.NODE_ENV==="development",disableCsp:false,contentSecurityPolicy:{reportOnly:!!process.env.CSP_REPORT_ONLY}});const stringifyReportTo=reportTo=>JSON.stringify(reportTo).replace(/\\"/g,'"');const reportToCached=memoizeResponseHeader("report-to",x=>x?x.split(",").map(y=>JSON.parse(y)):[],x=>x.map(stringifyReportTo).join(","),(r11,r21)=>{const r1Diff=differenceWith$1((r1,r2)=>r1.group===r2.group,r11,r21);return[...r1Diff,...r21]});const withBasePath=(reportTo,basePath)=>{if(basePath){return reportTo.map(({endpoints,...rest1})=>({...rest1,endpoints:endpoints.map(({url,...rest})=>{if(url.startsWith("/")){return{...rest,url:`${basePath}${url}`}}return{...rest,url}})}))}return reportTo};const _reporting=cfg=>chainableMiddleware(async(req,evt,ctx)=>{const config=await unpackConfig(cfg,req,evt,ctx);const{reportTo=[],csp:cspCfg}=config;const{basePath}=req.nextUrl;const arrayReportTo=withBasePath(Array.isArray(reportTo)?reportTo:[reportTo],basePath);if(arrayReportTo.length){const[,setMergeReportTo]=reportToCached(ctx);setMergeReportTo(arrayReportTo)}const[reportToCache]=reportToCached(ctx);if(!cspCfg){return}const cspGroup=cspCfg.reportTo;const groupMatches=group=>!group&&cspGroup==="default"||(cspGroup?group===cspGroup:false);const reportToHasCspGroup=!!reportToCache.find(r=>groupMatches(r.group));let cspBuilder=await cachedCspBuilder(ctx);const{reportUri="",reportSample}=cspCfg;if(reportUri){cspBuilder.withDirectives({"report-uri":[basePath&&reportUri.startsWith("/")?`${basePath}${reportUri}`:reportUri,]})}if(reportToHasCspGroup){cspBuilder.withDirectives({"report-to":[cspGroup]})}if(reportSample){if(cspBuilder.hasDirective("script-src")){cspBuilder.withDirectives({"script-src":["report-sample"]})}if(cspBuilder.hasDirective("style-src")){cspBuilder.withDirectives({"style-src":["report-sample"]})}if(cspBuilder.hasDirective("style-src-elem")){cspBuilder.withDirectives({"style-src-elem":["report-sample"]})}if(cspBuilder.hasDirective("style-src-attr")){cspBuilder.withDirectives({"style-src-attr":["report-sample"]})}}});const reporting=withDefaultConfig(_reporting,{csp:{reportSample:true,reportTo:"default",reportUri:"/api/reporting"},reportTo:{max_age:1800,endpoints:[{url:"/api/reporting"}]}});const _strictDynamic=cfg=>chainableMiddleware(async(req,evt,ctx)=>{const cspManifest=await cachedCspManifest(req);const cspBuilder=await cachedCspBuilder(ctx);const config=await unpackConfig(cfg,req,evt,ctx);const{fallbackScriptSrc,allowUnsafeEval,tellSupported:tellSupported1,userAgent,inclusiveFallback,extendScriptSrc}=config;const withUnsafeEval=values=>allowUnsafeEval?[...values,"unsafe-eval"]:values;const appendToStrictDynamic=withUnsafeEval(inclusiveFallback?fallbackScriptSrc:[]);const{supportsSrcIntegrityCheck,supportsStrictDynamic}=tellSupported1(userAgent);const isHashBasedByProxy=()=>!cspManifest.scripts.some(script=>!!script.src);const mode=extendScriptSrc?"append":"override";if(!cspManifest||!supportsStrictDynamic||!(supportsSrcIntegrityCheck||isHashBasedByProxy())){cspBuilder.withDirectives({"script-src":withUnsafeEval(fallbackScriptSrc)},mode);return}const scriptSrcHashes=cspManifest.scripts.map(({hash})=>hash);cspBuilder.withStrictDynamic(scriptSrcHashes,appendToStrictDynamic,extendScriptSrc)});const tellSupported=userAgent=>{const browserName=userAgent.browser.name||"";const browserVersion=Number(userAgent.browser.version||"");const isSafari=browserName.includes("Safari");const isFirefox=browserName.includes("Firefox");const isSafariWithoutStrictDynamic=isSafari&&browserVersion<15.4;const supportsStrictDynamic=!isSafariWithoutStrictDynamic;const supportsSrcIntegrityCheck=!(isSafari||isFirefox);return{supportsStrictDynamic,supportsSrcIntegrityCheck}};const strictDynamic=withDefaultConfig(_strictDynamic,{fallbackScriptSrc:["https:","unsafe-inline"],tellSupported,inclusiveFallback:true,extendScriptSrc:process.env.NODE_ENV==="development"},(k,l,r)=>k==="tellSupported"&& typeof l==="function"&& typeof r==="function"?ua=>{mergeRight$1(l(ua),r(ua))}:undefined);const _strictInlineStyles=cfg=>chainableMiddleware(async(req,evt,ctx)=>{const cspManifest=await cachedCspManifest(req);const cspBuilder=await cachedCspBuilder(ctx);if(!cspManifest){return}const{elem,attr}=cspManifest.styles;cspBuilder.withStyleHashes(elem,attr,false)});const strictInlineStyles=withDefaultConfig(_strictInlineStyles,{});const _csp=cfg=>chainableMiddleware(async(req,evt,ctx)=>{const[cspBuilder,config]=await Promise.all([cachedCspBuilder(ctx),unpackConfig(cfg,req,evt,ctx),]);let{reportOnly,directives:directives3,isDev}=config;if(isDev){cspBuilder.withDirectives({"script-src":["self","unsafe-eval","unsafe-inline"],"style-src":["self","unsafe-inline"],"font-src":["self","data:"],"connect-src":["self","ws:","wss:"]})}cspBuilder.withDirectives(directives3).withReportOnly(reportOnly)});const csp=withDefaultConfig(_csp,{directives:{"default-src":["self"],"object-src":["none"],"base-uri":["none"]},isDev:process.env.NODE_ENV==="development",reportOnly:!!process.env.CSP_REPORT_ONLY});const _telemetry=cfg=>chainableMiddleware(async(req,evt,ctx)=>{let{logHeaders,logExecutionTime,middlewares,profileLabel,logUrl}=await unpackConfig(cfg,req,evt,ctx);if(!middlewares.length){return}const timedLabel=`${Date.now()} [${profileLabel}]`;if(logExecutionTime){console.time(timedLabel)}const mwRes=await continued(chain(...middlewares))(req,evt,ctx);if(logExecutionTime){console.timeEnd(timedLabel)}if(logHeaders||logUrl){console.info(`${timedLabel}:`,JSON.stringify({url:logUrl?req.url:undefined,headers:logHeaders?{req:Object.fromEntries([...req.headers.entries()]),res:ctx?.res?.get()?Object.fromEntries([...ctx.res.get().headers.entries()]):undefined}:undefined}))}return mwRes});const telemetry=withDefaultConfig(_telemetry,{middlewares:[],profileLabel:"middleware",logHeaders:false,logExecutionTime:true,logUrl:false});const provideHashesOrNonce=strictDynamic();exports.chain=chain;exports.chainMatch=chainMatch;exports.chainableMiddleware=chainableMiddleware;exports.continued=continued;exports.csp=csp;exports.isNextJsDataRequest=isNextJsDataRequest;exports.isPagePathRequest=isPagePathRequest;exports.isPageRequest=isPageRequest;exports.isPreviewModeRequest=isPreviewModeRequest;exports.matchAnd=matchAnd;exports.matchNot=matchNot;exports.matchOr=matchOr;exports.memoize=memoize;exports.memoizeInChain=memoizeInChain;exports.memoizeResponseHeader=memoizeResponseHeader;exports.nextSafe=nextSafeMiddleware;exports.provideHashesOrNonce=provideHashesOrNonce;exports.reporting=reporting;exports.strictDynamic=strictDynamic;exports.strictInlineStyles=strictInlineStyles;exports.telemetry=telemetry;Object.keys(builder).forEach(function(k){if(k!=='default'&&!exports.hasOwnProperty(k))Object.defineProperty(exports,k,{enumerable:true,get:function(){return builder[k]}})})
