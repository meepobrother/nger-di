import { InjectFlags } from './../type';
import { PropertyHandler } from './types';
import { Injector} from '../injector_ng';
import { IPropertyDecorator } from '@nger/decorator'
export class ProtoRef<T, O>{
    metadata: IPropertyDecorator<T, O>;
    options: O;
    injector: Injector;
    handler: any;
    constructor(metadata: IPropertyDecorator<T, O>, injector: Injector) {
        this.injector = injector.create([], metadata.property as string);
        this.metadata = metadata;
        if (this.metadata.options) this.options = this.metadata.options;
        this.handler = injector.get<PropertyHandler>(this.metadata.metadataKey!, null, InjectFlags.Optional);
    }
    call(injector: Injector, ...args: any[]) {
        injector.getRecords().forEach((it, key) => {
            this.injector.setRecord(key, it)
        });
        const instance = injector.get(this.metadata.type);
        const val = Reflect.get(instance, this.metadata.property)
        this.handler && this.handler(val, instance, this);
        return Reflect.get(instance, this.metadata.property)
    }
}