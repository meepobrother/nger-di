import { createClassDecorator, createParameterDecorator } from '@nger/decorator';
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
    providedIn?: Type<any> | 'root' | null;
}
export const Injectable = createClassDecorator<InjectableOptions>(InjectableMetadataKey);

/**
 * inject
 */
export const InjectMetadataKey = `InjectMetadataKey`;
export interface InjectOptions {
    token: any;
}
export const Inject = createParameterDecorator<InjectOptions>(InjectMetadataKey);

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
