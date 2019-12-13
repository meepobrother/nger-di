import { createClassDecorator, createParameterDecorator, IParameterDecorator, IConstructorDecorator, IClassDecorator } from '@nger/decorator';
import { Provider, Type, ModuleWithProviders } from '../type';
/**
 * Module
 */
export const ModuleMetadataKey = `ModuleMetadataKey`;
export interface ModuleOptions {
    id?: any;
    providers?: (Provider[] | Provider)[];
    imports?: Array<Type<any> | ModuleWithProviders<any>>;
    exports?: Array<any>;
    bootstrap?: Array<Type<any>>;
}
export const Module = createClassDecorator<ModuleOptions>(ModuleMetadataKey);
export const NgModule = Module;

/**
 * 可注入的
 */
export const InjectableMetadataKey = `InjectableMetadataKey`;
export interface InjectableOptions {
    providedIn?: Type<any> | 'root' | null | string;
}
export const Injectable = createClassDecorator<InjectableOptions>(InjectableMetadataKey);

/**
 * controller
 */
export const ControllerMetadataKey = `ControllerMetadataKey`;
export interface ControllerOptions {
    path: string;
    providers?: (Provider | Provider[])[];
}
export const Controller = createClassDecorator<ControllerOptions | string>(ControllerMetadataKey, (item: IClassDecorator<any, ControllerOptions | string>) => {
    if (item.options) {
        if (typeof item.options === 'string') {
            item.options = {
                providers: [],
                path: item.options
            }
        } else {
            item.options = {
                providers: [],
                path: ``,
                ...item.options
            }
        }
    } else {
        item.options = {
            providers: [],
            path: ``
        }
    }
});

/**
 * inject
 */
export const InjectMetadataKey = `InjectMetadataKey`;
export interface InjectOptions {
    token: any;
}
function isInjectOptions(opt: any): opt is InjectOptions {
    return opt && !!opt.token;
}
export const Inject = createParameterDecorator<InjectOptions | any>(InjectMetadataKey, (item: IParameterDecorator<any, InjectOptions> | IConstructorDecorator<any, InjectOptions>) => {
    if (item.options) {
        if (isInjectOptions(item.options)) {
            item.options = {
                token: item.parameterType,
                ...item.options
            }
        } else {
            item.options = {
                token: item.options
            }
        }
    } else {
        item.options = {
            token: item.parameterType
        }
    }
});

/**
 * 可空
 */
export const OptionalMetadataKey = `OptionalMetadataKey`;
export interface OptionalOptions { }
export const Optional = createParameterDecorator<OptionalOptions>(OptionalMetadataKey);

/**
 * 自己
 */
export const SelfMetadataKey = `SelfMetadataKey`;
export interface SelfOptions { }
export const Self = createParameterDecorator<SelfOptions>(SelfMetadataKey);

/**
 * 忽略自己
 */
export const SkipSelfMetadataKey = `SkipSelfMetadataKey`;
export interface SkipSelfOptions { }
export const SkipSelf = createParameterDecorator<SkipSelfOptions>(SkipSelfMetadataKey);
