import { Type, InjectFlags, OptionFlags } from './type';
import { getClosureSafeProperty, stringify, resolveForwardRef } from './util';
import { InjectionToken } from './injection_token';
import { ɵɵinject, setCurrentInjector } from './injector_compatibility';
import { ɵɵdefineInjectable } from './def';
import { ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, StaticProvider, ValueProvider } from './type';
import { INJECTOR_SCOPE } from './scope';
export const SOURCE = '__source';
const _THROW_IF_NOT_FOUND = Symbol.for(`_THROW_IF_NOT_FOUND`);
export const THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;

export const INJECTOR = new InjectionToken<Injector>(
    'INJECTOR',
    -1 as any  // `-1` is used by Ivy DI system as special value to recognize it as `Injector`.
);

export class NullInjector implements Injector {
    get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
            error.name = 'NullInjectorError';
            throw error;
        }
        return notFoundValue;
    }
    clearCache(token: any): void { }
    create(records: StaticProvider[], source?: string | null): Injector {
        return new NullInjector() as Injector;
    }
    setStatic(records: StaticProvider[]) { }
    getRecord(token: any): Record | undefined {
        return;
    }
    setRecord(token: any, record: Record) { }
}

/**
 * Concrete injectors implement this interface.
 *
 * For more details, see the ["Dependency Injection Guide"](guide/dependency-injection).
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/injector_spec.ts region='Injector'}
 *
 * `Injector` returns itself when given `Injector` as a token:
 *
 * {@example core/di/ts/injector_spec.ts region='injectInjector'}
 *
 * @publicApi
 */
export abstract class Injector {
    static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
    static NULL: Injector = new NullInjector() as Injector;
    abstract get<T>(token: IToken<T>, notFoundValue?: T | undefined | null, flags?: InjectFlags): T;
    abstract create(records: StaticProvider[], source?: string | null): Injector;
    abstract setStatic(records: StaticProvider[]): void;
    abstract clearCache(token: any): void;
    abstract getRecord(token: any): Record | undefined;
    abstract setRecord(token: any, record: Record): void;
    static create(providers: StaticProvider[], parent?: Injector): Injector;
    static create(options: { providers: StaticProvider[], parent?: Injector, name?: string }): Injector;
    static create(
        options: StaticProvider[] | { providers: StaticProvider[], parent?: Injector, name?: string },
        parent?: Injector
    ): Injector {
        if (Array.isArray(options)) {
            return new StaticInjector(options, parent);
        } else {
            return new StaticInjector(options.providers, options.parent || parent, options.name || null);
        }
    }

    /** @nocollapse */
    static ngInjectableDef = ɵɵdefineInjectable({
        providedIn: 'any' as any,
        factory: () => ɵɵinject(INJECTOR),
    });

    /**
     * @internal
     * @nocollapse
     */
    static __NG_ELEMENT_ID__ = -1;
}

const IDENT = function <T>(value: T): T {
    return value;
};
const EMPTY = <any[]>[];
const CIRCULAR = IDENT;
const MULTI_PROVIDER_FN = function (): any[] {
    return Array.prototype.slice.call(arguments);
};
export const USE_VALUE =
    getClosureSafeProperty<ValueProvider>({ provide: String, useValue: getClosureSafeProperty });

const NG_TOKEN_PATH = 'ngTokenPath';
export const NG_TEMP_TOKEN_PATH = 'ngTempTokenPath';
const NULL_INJECTOR = Injector.NULL;
const NEW_LINE = /\n/gm;
const NO_NEW_LINE = 'ɵ';
export interface Abstract<T> extends Function {
    prototype: T;
}
export type ITokenString<T> = string & {
    target: T
}
export type ITokenAny<T> = (number | string | object | Function | Array<any>) & {
    target?: T;
}
export type IToken<T> =
    Type<T> |
    Abstract<T> |
    InjectionToken<T> |
    ITokenString<T> |
    ITokenAny<T>;
export class StaticInjector implements Injector {
    readonly parent: Injector;
    readonly source: string | null;

    private _records: Map<any, Record>;
    readonly scope: string | null;
    constructor(
        providers: StaticProvider[],
        parent: Injector = NULL_INJECTOR,
        source: string | null = null
    ) {
        this.parent = parent;
        this.source = source;
        const records = this._records = new Map<any, Record>();
        records.set(
            Injector, <Record>{ token: Injector, fn: IDENT, deps: EMPTY, value: this, useNew: false });
        records.set(
            INJECTOR, <Record>{ token: INJECTOR, fn: IDENT, deps: EMPTY, value: this, useNew: false });
        this.scope = recursivelyProcessProviders(records, providers);
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
        const records = this._records;
        let record = records.get(token);
        // if (record === undefined) {
        //     // This means we have never seen this record, see if it is tree shakable provider.
        //     const injectableDef = getInjectableDef(token);
        //     if (injectableDef) {
        //         const providedIn = injectableDef && injectableDef.providedIn;
        //         if (providedIn === 'any' || providedIn != null && providedIn === this.scope) {
        //             records.set(
        //                 token, record = resolveProvider(
        //                     { provide: token, useFactory: injectableDef.factory, deps: EMPTY }));
        //         }
        //     }
        //     if (record === undefined) {
        //         // Set record to null to make sure that we don't go through expensive lookup above again.
        //         records.set(token, null as any);
        //     }
        // }
        let lastInjector = setCurrentInjector(this);
        try {
            return tryResolveToken(token, record, records, this.parent, notFoundValue, flags);
        } catch (e) {
            return catchInjectorError(e, token, 'StaticInjectorError', this.source);
        } finally {
            setCurrentInjector(lastInjector);
        }
    }
    create(records: StaticProvider[], source: string | null = null) {
        return new StaticInjector(records, this, source)
    }
    setStatic(records: StaticProvider[]) {
        recursivelyProcessProviders(this._records, records)
    }
    toString() {
        const tokens = <string[]>[], records = this._records;
        records.forEach((v, token) => tokens.push(stringify(token)));
        return `StaticInjector[${tokens.join(', ')}]`;
    }
    getRecord(token: any): Record | undefined {
        return this._records.get(token);
    }
    setRecord(token: any, record: Record) {
        this._records.set(token, record)
    }
}

type SupportedProvider =
    ValueProvider | ExistingProvider | StaticClassProvider | ConstructorProvider | FactoryProvider;

interface Record {
    fn: Function;
    useNew: boolean;
    deps: DependencyRecord[];
    value: any;
}

interface DependencyRecord {
    token: any;
    options: number;
}

function resolveProvider(provider: SupportedProvider): Record {
    const deps = computeDeps(provider);
    let fn: Function = IDENT;
    let value: any = EMPTY;
    let useNew: boolean = false;
    let provide = resolveForwardRef(provider.provide);
    if (USE_VALUE in provider) {
        // We need to use USE_VALUE in provider since provider.useValue could be defined as undefined.
        value = (provider as ValueProvider).useValue;
    } else if ((provider as FactoryProvider).useFactory) {
        fn = (provider as FactoryProvider).useFactory;
    } else if ((provider as ExistingProvider).useExisting) {
        // Just use IDENT
    } else if ((provider as StaticClassProvider).useClass) {
        useNew = true;
        fn = resolveForwardRef((provider as StaticClassProvider).useClass);
    } else if (typeof provide == 'function') {
        useNew = true;
        fn = provide;
    } else {
        throw staticError(
            'StaticProvider does not have [useValue|useFactory|useExisting|useClass] or [provide] is not newable',
            provider);
    }
    return { deps, fn, useNew, value };
}

function multiProviderMixError(token: any) {
    return staticError('Cannot mix multi providers and regular providers', token);
}

function recursivelyProcessProviders(records: Map<any, Record>, provider: StaticProvider | StaticProvider[]): string |
    null {
    let scope: string | null = null;
    if (provider) {
        provider = resolveForwardRef(provider);
        if (Array.isArray(provider)) {
            // if we have an array recurse into the array
            for (let i = 0; i < provider.length; i++) {
                scope = recursivelyProcessProviders(records, provider[i]) || scope;
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
                        value: EMPTY
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
    token: any,
    record: Record | undefined,
    records: Map<any, Record>,
    parent: Injector,
    notFoundValue: any,
    flags: InjectFlags
): any {
    try {
        return resolveToken(token, record, records, parent, notFoundValue, flags);
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
        if (value == CIRCULAR) {
            throw Error(NO_NEW_LINE + 'Circular dependency');
        } else if (value === EMPTY) {
            record.value = CIRCULAR;
            let obj = undefined;
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
                        // Current Token to resolve
                        depRecord.token,
                        // A record which describes how to resolve the token.
                        // If undefined, this means we don't have such a record
                        childRecord,
                        // Other records we know about.
                        records,
                        // If we don't know how to resolve dependency and we should not check parent for it,
                        // than pass in Null injector.
                        !childRecord && !(options & OptionFlags.CheckParent) ? Injector.NULL : parent,
                        options & OptionFlags.Optional ? null : Injector.THROW_IF_NOT_FOUND,
                        InjectFlags.Default));
                }
            }
            record.value = value = useNew ? new (fn as any)(...deps) : fn.apply(obj, deps);
        }
    } else if (!(flags & InjectFlags.Self)) {
        value = parent.get(token, notFoundValue, InjectFlags.Default);
    } else if (!(flags & InjectFlags.Optional)) {
        value = Injector.NULL.get(token, notFoundValue);
    } else {
        value = Injector.NULL.get(token, typeof notFoundValue !== 'undefined' ? notFoundValue : null);
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
            if (token instanceof Array) {
                for (let j = 0, annotations = token; j < annotations.length; j++) {
                    const annotation = annotations[j];
                    if (annotation === InjectFlags.Optional) {
                        options = options | OptionFlags.Optional;
                    } else if (annotation === InjectFlags.SkipSelf) {
                        options = options & ~OptionFlags.CheckSelf;
                    } else if (annotation === InjectFlags.Self) {
                        options = options & ~OptionFlags.CheckParent;
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

export function catchInjectorError(
    e: any, token: any, injectorErrorName: string, source: string | null): never {
    const tokenPath: any[] = e[NG_TEMP_TOKEN_PATH];
    if (token[SOURCE]) {
        tokenPath.unshift(token[SOURCE]);
    }
    e.message = formatError('\n' + e.message, tokenPath, injectorErrorName, source);
    e[NG_TOKEN_PATH] = tokenPath;
    e[NG_TEMP_TOKEN_PATH] = null;
    throw e;
}

function formatError(
    text: string, obj: any, injectorErrorName: string, source: string | null = null): string {
    text = text && text.charAt(0) === '\n' && text.charAt(1) == NO_NEW_LINE ? text.substr(2) : text;
    let context = stringify(obj);
    if (obj instanceof Array) {
        context = obj.map(stringify).join(' -> ');
    } else if (typeof obj === 'object') {
        let parts = <string[]>[];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                parts.push(
                    key + ':' + (typeof value === 'string' ? JSON.stringify(value) : stringify(value)));
            }
        }
        context = `{${parts.join(', ')}}`;
    }
    return `${injectorErrorName}${source ? '(' + source + ')' : ''}[${context}]: ${text.replace(NEW_LINE, '\n  ')}`;
}

function staticError(text: string, obj: any): Error {
    return new Error(formatError(text, obj, 'StaticInjectorError'));
}
