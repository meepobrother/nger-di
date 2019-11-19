import { FactoryFn } from './interfaces/definition';
import { stringify } from '@nger/di.util'
import { NG_FACTORY_DEF } from './fields';
export function getFactoryDef<T>(type: any, throwNotFound: true): FactoryFn<T>;
export function getFactoryDef<T>(type: any): FactoryFn<T> | null;
export function getFactoryDef<T>(type: any, throwNotFound?: boolean): FactoryFn<T> | null {
    const hasFactoryDef = type.hasOwnProperty(NG_FACTORY_DEF);
    if (!hasFactoryDef && throwNotFound === true && ngDevMode) {
        throw new Error(`Type ${stringify(type)} does not have 'ɵfac' property.`);
    }
    return hasFactoryDef ? type[NG_FACTORY_DEF] : null;
}
