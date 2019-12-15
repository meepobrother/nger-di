import { Type } from './type';
import { ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, ValueProvider } from './type';
export interface InjectorTypeWithProviders<T> {
    ngModule: Type<T>;
    providers?: (Type<any> | ValueProvider | ExistingProvider | FactoryProvider | ConstructorProvider |
        StaticClassProvider | ClassProvider | any[])[];
}
