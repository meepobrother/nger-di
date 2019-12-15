import { getINgerDecorator, IConstructorDecorator, INgerDecorator } from '@nger/decorator';
import { InjectMetadataKey, InjectOptions, OptionalMetadataKey, SelfMetadataKey, SkipSelfMetadataKey } from './decorator';
import { isTypeProvider, Provider, StaticProvider, isClassProvider, InjectFlags } from './type';
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
        const injects = nger.constructors.filter(ctl => ctl.metadataKey === InjectMetadataKey) as IConstructorDecorator<any, InjectOptions>[];
        injects.map(it => {
            const parameters = nger.constructors.filter(ctl => ctl.parameterIndex === it.parameterIndex);
            const pros: any = [];
            if (parameters) {
                const optional = parameters.find(ctl => ctl.metadataKey === OptionalMetadataKey);
                if (optional) pros.push(InjectFlags.Optional);
                const self = parameters.find(ctl => ctl.metadataKey === SelfMetadataKey);
                if (self) pros.push(InjectFlags.Self);
                const skipSelf = parameters.find(ctl => ctl.metadataKey === SkipSelfMetadataKey);
                if (skipSelf) pros.push(InjectFlags.SkipSelf);
            }
            if (it.options) pros.push(it.options.token);
            deps[it.parameterIndex] = pros;
        });
        cls.parameters.map((it, index) => {
            deps[index] = deps[index] || it;
        })
    }
    return deps;
}
