import { Injector, IToken, Record } from "./injector";
import { InjectFlags, StaticProvider, Provider } from '../type'
import { stringify } from "../util";
const _THROW_IF_NOT_FOUND = Symbol.for(`_THROW_IF_NOT_FOUND`);
export class NullInjector extends Injector {
    constructor() {
        super();
        this.scope = null;
        this.source = null;
        this.parent = undefined;
    }
    get<T>(token: IToken<T>, notFoundValue?: any, flags?: InjectFlags): T {
        if (notFoundValue === _THROW_IF_NOT_FOUND) {
            const error = new Error(`NullInjectorError: No provider for ${stringify(token)}!`);
            error.name = 'NullInjectorError';
            throw error;
        }
        return notFoundValue;
    }
    getInjector(scope: string): Injector {
        throw new Error("Method not implemented.");
    }
    getRecords(): Map<any, Record> {
        throw new Error("Method not implemented.");
    }
    setProvider(providers: Provider[]): void {
        throw new Error("Method not implemented.");
    }
    setStatic(records: StaticProvider[]): void {
        throw new Error("Method not implemented.");
    }
    toString(): string {
        return `NullInjector`
    }
    getRecord(token: any): Record | undefined {
        throw new Error("Method not implemented.");
    }
    setRecord(token: any, record: Record): void {
        throw new Error("Method not implemented.");
    }
    create(records: StaticProvider[], source?: string): Injector {
        throw new Error("Method not implemented.");
    }
}