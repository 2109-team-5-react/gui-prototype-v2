"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSdk = exports.getMeshSDK = exports.getBuiltMesh = exports.documentsInSDL = exports.getMeshOptions = exports.rawConfig = void 0;
const tslib_1 = require("tslib");
const runtime_1 = require("@graphql-mesh/runtime");
const store_1 = require("@graphql-mesh/store");
const path_1 = require("path");
const cache_inmemory_lru_1 = (0, tslib_1.__importDefault)(require("@graphql-mesh/cache-inmemory-lru"));
const openapi_1 = (0, tslib_1.__importDefault)(require("@graphql-mesh/openapi"));
const merger_stitching_1 = (0, tslib_1.__importDefault)(require("@graphql-mesh/merger-stitching"));
const oas_schema_js_1 = (0, tslib_1.__importDefault)(require("./sources/test_authors/oas-schema.js"));
const oas_schema_js_2 = (0, tslib_1.__importDefault)(require("./sources/test_books/oas-schema.js"));
const importedModules = {
    // @ts-ignore
    ["@graphql-mesh/cache-inmemory-lru"]: cache_inmemory_lru_1.default,
    // @ts-ignore
    ["@graphql-mesh/openapi"]: openapi_1.default,
    // @ts-ignore
    ["@graphql-mesh/merger-stitching"]: merger_stitching_1.default,
    // @ts-ignore
    [".mesh/sources/test_authors/oas-schema.js"]: oas_schema_js_1.default,
    // @ts-ignore
    [".mesh/sources/test_books/oas-schema.js"]: oas_schema_js_2.default
};
const baseDir = (0, path_1.join)(__dirname, '..');
const syncImportFn = (moduleId) => {
    const relativeModuleId = ((0, path_1.isAbsolute)(moduleId) ? (0, path_1.relative)(baseDir, moduleId) : moduleId).split('\\').join('/');
    if (!(relativeModuleId in importedModules)) {
        throw new Error(`Cannot find module '${relativeModuleId}'.`);
    }
    return importedModules[relativeModuleId];
};
const importFn = async (moduleId) => syncImportFn(moduleId);
const rootStore = new store_1.MeshStore('.mesh', new store_1.FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
}), {
    readonly: true,
    validate: false
});
const cache_inmemory_lru_2 = (0, tslib_1.__importDefault)(require("@graphql-mesh/cache-inmemory-lru"));
const graphql_subscriptions_1 = require("graphql-subscriptions");
const events_1 = require("events");
const utils_1 = require("@graphql-mesh/utils");
const openapi_2 = (0, tslib_1.__importDefault)(require("@graphql-mesh/openapi"));
const merger_stitching_2 = (0, tslib_1.__importDefault)(require("@graphql-mesh/merger-stitching"));
const utils_2 = require("@graphql-mesh/utils");
exports.rawConfig = { "sources": [{ "name": "test_authors", "handler": { "openapi": { "source": "./openapi-schemas/test_authors-schema.yaml" } } }, { "name": "test_books", "handler": { "openapi": { "source": "./openapi-schemas/test_books-schema.yaml" } } }] };
async function getMeshOptions() {
    const cache = new cache_inmemory_lru_2.default({
        ...(exports.rawConfig.cache || {}),
        store: rootStore.child('cache'),
    });
    const eventEmitter = new events_1.EventEmitter({ captureRejections: true });
    eventEmitter.setMaxListeners(Infinity);
    const pubsub = new graphql_subscriptions_1.PubSub({ eventEmitter });
    const sourcesStore = rootStore.child('sources');
    const logger = new utils_1.DefaultLogger('🕸️');
    const sources = [];
    const transforms = [];
    const testAuthorsTransforms = [];
    const testBooksTransforms = [];
    const additionalTypeDefs = [];
    const testAuthorsHandler = new openapi_2.default({
        name: exports.rawConfig.sources[0].name,
        config: exports.rawConfig.sources[0].handler["openapi"],
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child(exports.rawConfig.sources[0].name),
        logger: logger.child(exports.rawConfig.sources[0].name),
        importFn
    });
    const testBooksHandler = new openapi_2.default({
        name: exports.rawConfig.sources[1].name,
        config: exports.rawConfig.sources[1].handler["openapi"],
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child(exports.rawConfig.sources[1].name),
        logger: logger.child(exports.rawConfig.sources[1].name),
        importFn
    });
    sources.push({
        name: 'test_authors',
        handler: testAuthorsHandler,
        transforms: testAuthorsTransforms
    });
    sources.push({
        name: 'test_books',
        handler: testBooksHandler,
        transforms: testBooksTransforms
    });
    const merger = new merger_stitching_2.default({
        cache,
        pubsub,
        logger: logger.child('StitchingMerger'),
        store: rootStore.child('stitchingMerger')
    });
    const additionalResolversRawConfig = [];
    const additionalResolvers = await (0, utils_2.resolveAdditionalResolvers)(baseDir, additionalResolversRawConfig, importFn, pubsub);
    const liveQueryInvalidations = exports.rawConfig.liveQueryInvalidations;
    return {
        sources,
        transforms,
        additionalTypeDefs,
        additionalResolvers,
        cache,
        pubsub,
        merger,
        logger,
        liveQueryInvalidations,
    };
}
exports.getMeshOptions = getMeshOptions;
exports.documentsInSDL = [];
async function getBuiltMesh() {
    const meshConfig = await getMeshOptions();
    return (0, runtime_1.getMesh)(meshConfig);
}
exports.getBuiltMesh = getBuiltMesh;
async function getMeshSDK() {
    const { sdkRequester } = await getBuiltMesh();
    return getSdk(sdkRequester);
}
exports.getMeshSDK = getMeshSDK;
function getSdk(requester) {
    return {};
}
exports.getSdk = getSdk;
