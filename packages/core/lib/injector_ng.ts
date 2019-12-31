import { InjectFlags, OptionFlags, Provider } from './type';
import { stringify, resolveForwardRef, staticError, catchInjectorError, NG_TEMP_TOKEN_PATH, NO_NEW_LINE } from './util';
import { InjectionToken } from './injection_token';
import { setCurrentInjector } from './injector_compatibility';
import { ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, StaticProvider, ValueProvider } from './type';
import { INJECTOR_SCOPE } from './scope';
import { getINgerDecorator, IClassDecorator } from '@nger/decorator';
import { InjectableMetadataKey, InjectableOptions, Optional, SkipSelf, Self, Inject } from './decorator';
import { providerToStaticProvider } from './providerToStaticProvider';
export function getInjectableDef(token: any): InjectableOptions | undefined {
    if (!token) return undefined;
    if (token instanceof InjectionToken) {
        if (token.options) {
            return token.options;
        }
    }
    const nger = getINgerDecorator(token);
    const injectable = nger.classes.find(it => it.metadataKey === InjectableMetadataKey) as IClassDecorator<any, InjectableOptions>;
    return injectable && injectable.options;
}
import {
    NULL_INJECTOR, EMPTY, IDENT, MULTI_PROVIDER_FN,
    Injector, IToken, USE_VALUE, INJECTOR, THROW_IF_NOT_FOUND, CIRCULAR, Record, DependencyRecord
} from './injector/index'
export class StaticInjector implements Injector {
    readonly parent: Injector;
    source: string | null;
    private _records: Map<any, Record>;
    scope: string | null;
    constructor(
        providers: StaticProvider[],
        parent: Injector = NULL_INJECTOR,
        source: string | null = null
    ) {
        this.parent = parent;
        this.source = source;
        const records = this._records = new Map<any, Record>();
        records.set(
            Injector, <Record>{ token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false, noCache: false });
        records.set(
            INJECTOR, <Record>{ token: INJECTOR, fn: IDENT, deps: EMPTY, value: this, useNew: false, noCache: false });
        this.scope = recursivelyProcessProviders(this, providers);
    }
    clearCache(token: any): void {
        const record = this._records.get(token)
        if (record) record.value = null;
    }
    debug() {
        this._records.forEach((item, key) => {
            if (Array.isArray(item)) {
                console.debug(`injector:multi:${this.source} ${key.name} registed ${item.length}`)
            } else {
                console.debug(`injector:${this.source} ${(key && key.name) || ''} registed, Dependeny: ${stringify(item.deps.map(dep => dep.token))}`)
            }
        });
    }
    get<T>(token: IToken<T>, notFoundValue?: T | undefined | null, flags: InjectFlags = InjectFlags.Default): T {
        return this._get(token, notFoundValue, flags);
    }
    getInjector(scope: string): Injector {
        if (this.scope === scope) {
            return this;
        }
        return this.parent.getInjector(scope)
    }
    getRecords() {
        return this._records;
    }
    _get<T>(token: IToken<T>, notFoundValue?: T | undefined | null, flags: InjectFlags = InjectFlags.Default): T {
        const records = this._records;
        let record = records.get(token);
        if (record === undefined) {
            try {
                const nger = getINgerDecorator(token as any);
                if (nger.classes.length > 0) {
                    const injectableDef = getInjectableDef(token);
                    if (injectableDef) {
                        const providedIn = injectableDef && injectableDef.providedIn;
                        if (providedIn === 'any' || providedIn != null && providedIn === this.scope) {
                            if (injectableDef.factory) {
                                record = resolveProvider({ provide: token, useFactory: injectableDef.factory, deps: injectableDef.deps || EMPTY })
                            } else {
                                record = resolveProvider(providerToStaticProvider(token as any))
                            }
                            records.set(
                                token,
                                record
                            );
                        }
                    }
                }
                if (record === undefined) {
                    records.set(token, null as any);
                }
            } catch (e) { }
        }
        let lastInjector = setCurrentInjector(this);
        try {
            return tryResolveToken(this, token, record, records, this.parent, notFoundValue, flags);
        } catch (e) {
            return catchInjectorError(e, token, 'StaticInjectorError', this.source);
        } finally {
            setCurrentInjector(lastInjector);
        }
    }
    create(records: StaticProvider[], source: string | null = null): Injector {
        return new StaticInjector(records, this, source)
    }
    setProvider(providers: Provider[]) {
        const records = providers.map(it => providerToStaticProvider(it))
        this.scope = recursivelyProcessProviders(this, records) || this.scope;
    }
    setStatic(records: StaticProvider[]) {
        this.scope = recursivelyProcessProviders(this, records) || this.scope;
    }
    toString() {
        const tokens = <string[]>[], records = this._records;
        records.forEach((v, token) => tokens.push(stringify(token)));
        return `StaticInjector[${tokens.join(', ')}]`;
    }
    getRecord(token: any): Record | undefined {
        const record = this._records.get(token);
        if (record) return record;
        return this.parent && this.parent.getRecord(token)
    }
    setRecord(token: any, record: Record) {
        this._records.set(token, record)
    }
}

type SupportedProvider =
    ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider;

function resolveProvider(provider: SupportedProvider): Record {
    const deps = computeDeps(provider);
    let fn: Function = IDENT;
    let value: any = EMPTY;
    let useNew: boolean = false;
    let provide = resolveForwardRef(provider.provide);
    let noCache = false;
    if (USE_VALUE in provider) {
        // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
        value = (provider as ValueProvider).useValue;
    } else if ((provider as FactoryProvider).useFactory) {
        fn = (provider as FactoryProvider).useFactory;
        noCache = !!(provider as FactoryProvider).noCache;
    } else if ((provider as ExistingProvider).useExisting) {
        // Just use IDENT
    } else if ((provider as StaticClassProvider).useClass) {
        useNew = true;
        fn = resolveForwardRef((provider as StaticClassProvider).useClass);
        noCache = !!(provider as StaticClassProvider).noCache;
    } else if (typeof provide == 'function') {
        useNew = true;
        fn = provide;
        noCache = !!(provider as ConstructorProvider).noCache;
    } else {
        throw staticError(
            'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
            provider);
    }
    return { deps, fn, useNew, value, noCache };
}

function multiProviderMixError(token: any) {
    return staticError('Cannot mix multi providers and regular providers', token);
}

function recursivelyProcessProviders(injector: Injector, provider: StaticProvider | StaticProvider[]): string |
    null {
    const records = injector.getRecords();
    let scope: string | null = null;
    if (provider) {
        provider = resolveForwardRef(provider);
        if (Array.isArray(provider)) {
            // if we have an array recurse into the array
            for (let i = 0; i < provider.length; i++) {
                scope = recursivelyProcessProviders(injector, provider[i]) || scope;
            }
        } else if (typeof provider === 'function') {
            // Functions were supported in ReflectiveInjector, but are not here. For safety give useful
            // error messages
            throw staticError('Function/Class not supported', provider);
        } else if (provider && typeof provider === 'object' && provider.provide) {
            // At this point we have what looks like a provider: {provide: ?, ....}
            let token = resolveForwardRef(provider.provide);
            const resolvedProvider = resolveProvider(provider);
            if (provider.multi === true) {
                // This is a multi provider.
                let multiProvider: Record | undefined = records.get(token);
                if (multiProvider) {
                    if (multiProvider.fn !== MULTI_PROVIDER_FN) {
                        throw multiProviderMixError(token);
                    }
                } else {
                    // Create a placeholder factory which will look up the constituents of the multi provider.
                    records.set(token, multiProvider = <Record>{
                        token: provider.provide,
                        deps: [],
                        useNew: false,
                        fn: MULTI_PROVIDER_FN,
                        value: EMPTY,
                        noCache: true
                    });
                }
                // Treat the provider as the token.
                token = provider;
                multiProvider.deps.push({ token, options: OptionFlags.Default });
            }
            const record = records.get(token);
            if (record && record.fn == MULTI_PROVIDER_FN) {
                throw multiProviderMixError(token);
            }
            if (token === INJECTOR_SCOPE) {
                scope = resolvedProvider.value;
            }
            records.set(token, resolvedProvider);
        } else {
            throw staticError('Unexpected provider', provider);
        }
    }
    return scope;
}

function tryResolveToken(
    injector: Injector,
    token: any,
    record: Record | undefined,
    records: Map<any, Record>,
    parent: Injector,
    notFoundValue: any,
    flags: InjectFlags
): any {
    try {
        return resolveToken(injector, token, record, records, parent, notFoundValue, flags);
    } catch (e) {
        // ensure that 'e' is of type Error.
        if (!(e instanceof Error)) {
            e = new Error(e);
        }
        const path: any[] = e[NG_TEMP_TOKEN_PATH] = e[NG_TEMP_TOKEN_PATH] || [];
        path.unshift(token);
        if (record && record.value == CIRCULAR) {
            // Reset the Circular flag.
            record.value = EMPTY;
        }
        throw e;
    }
}

function resolveToken(
    injector: Injector,
    token: any,
    record: Record | undefined,
    records: Map<any, Record>,
    parent: Injector,
    notFoundValue: any,
    flags: InjectFlags
): any {
    let value;
    if (record && !(flags & InjectFlags.SkipSelf)) {
        // If we don't have a record, this implies that we don't own the provider hence don't know how
        // to resolve it.
        value = record.value;
        if (record.noCache) {
            value = EMPTY;
        }
        if (value == CIRCULAR) {
            throw Error(NO_NEW_LINE + 'Circular dependency');
        } else if (value === EMPTY) {
            record.value = CIRCULAR;
            let useNew = record.useNew;
            let fn = record.fn;
            let depRecords = record.deps;
            let deps = EMPTY;
            if (depRecords.length) {
                deps = [];
                for (let i = 0; i < depRecords.length; i++) {
                    const depRecord: DependencyRecord = depRecords[i];
                    const options = depRecord.options;
                    const childRecord =
                        options & OptionFlags.CheckSelf ? records.get(depRecord.token) : undefined;
                    deps.push(tryResolveToken(
                        injector,
                        // Current Token to resolve
                        depRecord.token,
                        // A record which describes how to resolve the token.
                        // If undefined, this means we don't have such a record
                        childRecord,
                        // Other records we know about.
                        records,
                        // If we don't know how to resolve dependency and we should not check parent for it,
                        // than pass in Null injector.
                        !childRecord && !(options & OptionFlags.CheckParent) ? NULL_INJECTOR : parent,
                        options & OptionFlags.Optional ? null : THROW_IF_NOT_FOUND,
                        InjectFlags.Default));
                }
            }
            record.value = value = useNew ? new (fn as any)(...deps) : fn(...deps);
        }
    } else if (!(flags & InjectFlags.Self)) {
        value = parent.get(token, notFoundValue, InjectFlags.Default);
    } else if (!(flags & InjectFlags.Optional)) {
        value = NULL_INJECTOR.get(token, notFoundValue);
    } else {
        value = NULL_INJECTOR.get(token, typeof notFoundValue !== 'undefined' ? notFoundValue : null);
    }
    return value;
}

function computeDeps(provider: StaticProvider): DependencyRecord[] {
    let deps: DependencyRecord[] = EMPTY;
    const providerDeps: any[] =
        (provider as ExistingProvider & StaticClassProvider & ConstructorProvider).deps || [];
    if (providerDeps && providerDeps.length) {
        deps = [];
        for (let i = 0; i < providerDeps.length; i++) {
            let options = OptionFlags.Default;
            let token = resolveForwardRef(providerDeps[i]);
            if (Array.isArray(token)) {
                for (let j = 0, annotations = token; j < annotations.length; j++) {
                    const annotation = annotations[j];
                    if (annotation === InjectFlags.Optional || annotation instanceof Optional) {
                        options = options | OptionFlags.Optional;
                    } else if (annotation === InjectFlags.SkipSelf || annotation instanceof SkipSelf) {
                        options = options & ~OptionFlags.CheckSelf;
                    } else if (annotation === InjectFlags.Self || annotation instanceof Self) {
                        options = options & ~OptionFlags.CheckParent;
                    } else if (annotation instanceof Inject) {
                        if (annotation.options) {
                            token = resolveForwardRef(annotation.options.token);
                        } else {
                            throw new Error(`Inject options token not found!`)
                        }
                    } else {
                        token = resolveForwardRef(annotation);
                    }
                }
            }
            deps.push({ token, options });
        }
    } else if ((provider as ExistingProvider).useExisting) {
        const token = resolveForwardRef((provider as ExistingProvider).useExisting);
        deps = [{ token, options: OptionFlags.Default }];
    } else if (!providerDeps && !(USE_VALUE in provider)) {
        // useValue & useExisting are the only ones which are exempt from deps all others need it.
        throw staticError('\'deps\' required', provider);
    }
    return deps;
}

