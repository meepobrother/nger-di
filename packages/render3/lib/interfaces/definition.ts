import { Type } from "@nger/di.types";

/**
 * Definition of what a factory function should look like.
 */
export type FactoryFn<T> = {
    /**
     * Subclasses without an explicit constructor call through to the factory of their base
     * definition, providing it with their own constructor to instantiate.
     */
    <U extends T>(t: Type<U>): U;

    /**
     * If no constructor to instantiate is provided, an instance of type T itself is created.
     */
    (t?: undefined): T;
};