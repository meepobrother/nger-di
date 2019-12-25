import { getINgerDecorator, IConstructorDecorator, INgerDecorator, IMethodDecorator, IParameterDecorator, IPropertyDecorator, IClassDecorator } from '@nger/decorator';
import { InjectMetadataKey, InjectOptions, OptionalMetadataKey, SelfMetadataKey, SkipSelfMetadataKey } from './decorator';
import { isTypeProvider, Provider, StaticProvider, isClassProvider, InjectFlags, Type, isStaticClassProvider, isValueProvider, isFactoryProvider, isExistingProvider } from './type';
import { InjectionToken } from './injection_token';
import { Injector } from './injector_ng';
export function providerToStaticProvider(provider: Provider): StaticProvider {
    if (isTypeProvider(provider)) {
        const nger = getINgerDecorator(provider);
        const deps: any[] = getClassInjectDeps(nger)
        return {
            provide: provider,
            deps: deps
        }
    } else if (isClassProvider(provider)) {
        const nger = getINgerDecorator(provider.useClass);
        const deps: any[] = getClassInjectDeps(nger);
        const injects = nger.constructors.filter(ctl => ctl.metadataKey === InjectMetadataKey) as IConstructorDecorator<any, InjectOptions>[];
        injects.map(it => {
            if (it.options) deps.push([it.options.token])
        });
        return {
            provide: provider.provide,
            useClass: provider.useClass,
            multi: provider.multi,
            deps: deps
        }
    } else {
        return provider;
    }
}

export function getClassInjectDeps(nger: INgerDecorator) {
    let deps: any[] = [];
    const cls = nger.classes.find(ct => ct);
    if (cls) {
        deps = new Array(cls.parameters.length);
        nger.constructors.map(it => {
            deps[it.parameterIndex] = deps[it.parameterIndex] || [];
            if (it.metadataKey === OptionalMetadataKey) {
                deps[it.parameterIndex].push(InjectFlags.Optional)
            } else if (it.metadataKey === SelfMetadataKey) {
                deps[it.parameterIndex].push(InjectFlags.Self)
            } else if (it.metadataKey === SkipSelfMetadataKey) {
                deps[it.parameterIndex].push(InjectFlags.SkipSelf)
            } else if (it.metadataKey === InjectMetadataKey) {
                let item = it as IConstructorDecorator<any, InjectOptions>;
                const options = item.options
                if (options) {
                    deps[it.parameterIndex].push(options.token)
                }
            } else {
                console.log(`getClassInjectDeps error ${it.metadataKey}`)
            }
        })
        cls.parameters.map((it, index) => {
            deps[index] = deps[index] || it;
        })
    }
    return deps;
}

/**
 * 装饰器扫描器
 */
interface GetIngerDecorator<T = any, O = any> {
    (type: Type<T>): INgerDecorator<T, O>
}
export const GET_INGER_DECORATOR = new InjectionToken<GetIngerDecorator>(`GET_INGER_DECORATOR`)
export interface ParameterHandler<T = any, O = any> {
    (handler: Function, parameters: Array<any>, instance: T, injector: Injector, parameter: IParameterDecorator<T, O>): void;
}
export interface PropertyHandler<T = any, O = any> {
    (value: any, instance: T, injector: Injector, parameter: IPropertyDecorator<T, O>): void;
}
export interface MethodHandler<T = any, O = any> {
    (handler: Function, instance: T, injector: Injector, parameter: IMethodDecorator<T, O>): void;
}
export interface ClassHandler<T = any, O = any> {
    (injector: Injector, parameter: IClassDecorator<T, O>): void;
}
export function createNewProxy<T extends object>(_injector: Injector, type: Type<T>, ...deps: any[]): T {
    const injector = _injector.create([], type.name)
    const getDecorator = injector.get(GET_INGER_DECORATOR, getINgerDecorator)
    const metadata = getDecorator(type);
    const instance = new type(...deps);
    return createProxy(instance, metadata, injector)
}

export function createProxy<T extends object>(instance: T, metadata: INgerDecorator, injector: Injector): T {
    return new Proxy<T>(instance, {
        get(target: T, p: PropertyKey, receiver: any): any {
            const callHandler = Reflect.get(target, p);
            const isMethod = metadata.methods.some(it => it.property === p);
            if (isMethod) {
                const decorators = metadata.methods.filter(it => it.property === p) as IMethodDecorator<T, any>[];
                if (decorators && decorators.length > 0) {
                    return (...args: any[]) => {
                        let length = decorators[0].paramTypes.length > args.length ? decorators[0].paramTypes.length : args.length;
                        const parameters = new Array(length).fill(undefined);
                        decorators.map(it => {
                            it.parameters.map(parameter => {
                                const handler = injector.get<ParameterHandler>(parameter.metadataKey, null, InjectFlags.Optional);
                                handler && handler(callHandler, parameters, target, injector, parameter);
                            })
                        });
                        const pars = parameters.map((it, index) => {
                            return Reflect.get(args, index) || it;
                        });
                        return callHandler.bind(target)(...pars)
                    }
                }
                return callHandler;
            } else if (metadata.properties.length > 0) {
                metadata.properties.filter(it => it.property === p).map(it => {
                    const methodHandler = injector.get<PropertyHandler>(it.metadataKey!, null, InjectFlags.Optional);
                    methodHandler && methodHandler(callHandler, target, injector, it);
                });
                return Reflect.get(instance, p)
            } else {
                return callHandler;
            }
        }
    })
}

export function createFuncProxy(injector: Injector, fn: Function, ...deps: any[]) {
    let that = undefined;
    const instance = fn.apply(that, ...deps);
    if (typeof instance === 'string') {
        return instance;
    }
    if (typeof instance === 'number') {
        return instance;
    }
    if (typeof instance === 'boolean') {
        return instance;
    }
    if (typeof instance === 'bigint') {
        return instance;
    }
    if (typeof instance === 'symbol') {
        return instance;
    }
    if (typeof instance === 'undefined') {
        return instance;
    }
    const obj = Reflect.getPrototypeOf(instance);
    if (obj) {
        const type = Reflect.get(obj, 'constructor');
        if (type) {
            const getDecorator = injector.get(GET_INGER_DECORATOR, getINgerDecorator)
            const metadata = getDecorator(type);
            if (metadata.classes.length > 0) {
                return createProxy(instance, metadata, injector);
            }
        }
    }
    return instance;
}
