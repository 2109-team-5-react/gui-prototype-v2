import { getMesh } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { join, relative, isAbsolute, dirname } from 'path';
import { fileURLToPath } from 'url';
import ExternalModule_0 from '@graphql-mesh/cache-inmemory-lru';
import ExternalModule_1 from '@graphql-mesh/openapi';
import ExternalModule_2 from '@graphql-mesh/merger-stitching';
import ExternalModule_3 from './sources/test_authors/oas-schema.js';
import ExternalModule_4 from './sources/test_books/oas-schema.js';
const importedModules = {
    // @ts-ignore
    ["@graphql-mesh/cache-inmemory-lru"]: ExternalModule_0,
    // @ts-ignore
    ["@graphql-mesh/openapi"]: ExternalModule_1,
    // @ts-ignore
    ["@graphql-mesh/merger-stitching"]: ExternalModule_2,
    // @ts-ignore
    [".mesh/sources/test_authors/oas-schema.js"]: ExternalModule_3,
    // @ts-ignore
    [".mesh/sources/test_books/oas-schema.js"]: ExternalModule_4
};
const baseDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const syncImportFn = (moduleId) => {
    const relativeModuleId = (isAbsolute(moduleId) ? relative(baseDir, moduleId) : moduleId).split('\\').join('/');
    if (!(relativeModuleId in importedModules)) {
        throw new Error(`Cannot find module '${relativeModuleId}'.`);
    }
    return importedModules[relativeModuleId];
};
const importFn = async (moduleId) => syncImportFn(moduleId);
const rootStore = new MeshStore('.mesh', new FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
}), {
    readonly: true,
    validate: false
});
import MeshCache from '@graphql-mesh/cache-inmemory-lru';
import { PubSub } from 'graphql-subscriptions';
import { EventEmitter } from 'events';
import { DefaultLogger } from '@graphql-mesh/utils';
import OpenapiHandler from '@graphql-mesh/openapi';
import StitchingMerger from '@graphql-mesh/merger-stitching';
import { resolveAdditionalResolvers } from '@graphql-mesh/utils';
export const rawConfig = { "sources": [{ "name": "test_authors", "handler": { "openapi": { "source": "./openapi-schemas/test_authors-schema.yaml" } } }, { "name": "test_books", "handler": { "openapi": { "source": "./openapi-schemas/test_books-schema.yaml" } } }] };
export async function getMeshOptions() {
    const cache = new MeshCache({
        ...(rawConfig.cache || {}),
        store: rootStore.child('cache'),
    });
    const eventEmitter = new EventEmitter({ captureRejections: true });
    eventEmitter.setMaxListeners(Infinity);
    const pubsub = new PubSub({ eventEmitter });
    const sourcesStore = rootStore.child('sources');
    const logger = new DefaultLogger('🕸️');
    const sources = [];
    const transforms = [];
    const testAuthorsTransforms = [];
    const testBooksTransforms = [];
    const additionalTypeDefs = [];
    const testAuthorsHandler = new OpenapiHandler({
        name: rawConfig.sources[0].name,
        config: rawConfig.sources[0].handler["openapi"],
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child(rawConfig.sources[0].name),
        logger: logger.child(rawConfig.sources[0].name),
        importFn
    });
    const testBooksHandler = new OpenapiHandler({
        name: rawConfig.sources[1].name,
        config: rawConfig.sources[1].handler["openapi"],
        baseDir,
        cache,
        pubsub,
        store: sourcesStore.child(rawConfig.sources[1].name),
        logger: logger.child(rawConfig.sources[1].name),
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
    const merger = new StitchingMerger({
        cache,
        pubsub,
        logger: logger.child('StitchingMerger'),
        store: rootStore.child('stitchingMerger')
    });
    const additionalResolversRawConfig = [];
    const additionalResolvers = await resolveAdditionalResolvers(baseDir, additionalResolversRawConfig, importFn, pubsub);
    const liveQueryInvalidations = rawConfig.liveQueryInvalidations;
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
export const documentsInSDL = /*#__PURE__*/ [];
export async function getBuiltMesh() {
    const meshConfig = await getMeshOptions();
    return getMesh(meshConfig);
}
export async function getMeshSDK() {
    const { sdkRequester } = await getBuiltMesh();
    return getSdk(sdkRequester);
}
export function getSdk(requester) {
    return {};
}
