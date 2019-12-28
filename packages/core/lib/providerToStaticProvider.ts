import { getINgerDecorator, IConstructorDecorator, INgerDecorator, } from '@nger/decorator';
import { InjectMetadataKey, InjectOptions, OptionalMetadataKey, SelfMetadataKey, SkipSelfMetadataKey } from './decorator';
import { isTypeProvider, Provider, StaticProvider, isClassProvider, InjectFlags, Type } from './type';
import { InjectionToken } from './injection_token';
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
