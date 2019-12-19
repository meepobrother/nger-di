## @nger/di

<p>
    <a href="https://www.npmjs.com/package/@nger/cli">
        <img src="https://img.shields.io/npm/v/@nger/cli.svg" alt="Version">
    </a>
    <a href="https://www.npmjs.com/package/@nger/cli">
        <img src="https://img.shields.io/npm/l/@nger/cli.svg" alt="License">
    </a>
    <a href="https://npmcharts.com/compare/@nger/cli?minimal=true">
        <img src="https://img.shields.io/npm/dm/@nger/cli.svg" alt="Downloads">
    </a>
</p>

> 一款零依赖的`依赖注入`工具 - from angular

package size:  `10.2 kB`
unpacked size: `40.6 kB`

## static create
```ts
Injector.create([])
```

## scope
> injector 作用域
```ts
import { Injector } from '@nger/di';
// scope = null
const nullInjector = Injector.create([])
// scope = root , parent scope = null
const injector = nullInjector.create([{provide: INJECTOR_SCOPE, useValue: 'root'}])
// scope = platform , parent scope = root , parent parent scope = null
const injector = injector.create([{provide: INJECTOR_SCOPE, useValue: 'platform'}])
```

## multi provider
> 用于渐进式注入

```ts
import { rootInjector, InjectionToken } from '@nger/di';
const token = new InjectionToken(`token`)
const inejctor = rootInjector.create([{ provide: INJECTOR_SCOPE, useValue: 'platform' }, { provide: token, useValue: 1, multi: true }])
const appModuleInjector = inejctor.create([
    { provide: token, useValue: 2, multi: true }, 
    { provide: token, useValue: 3, multi: true }
], 'AppModule')
// token wile be [1,2,3]
const tokens = appModuleInjector.get(token)
```

## ValueProvider
> 使用指定值

```ts
rootInjector.create([{
    provide: Car,
    useValue: new Car()
}])
```

## ConstructorProvider
> 快捷注入，使用自身

```ts
rootInjector.create([{
    provide: Car,
    deps: [CarNum]
}])
```

## ExistingProvider
> 使用已注入的
```ts
rootInjector.create([{
    provide: Car,
    useExisting: Car2
}])
```

## StaticClassProvider
> 使用useClass指定的类
```ts
rootInjector.create([{
    provide: Car,
    useClass: Car,
    deps: [CarNum]
}])
```

## FactoryProvider
> 使用指定factory进行创建

```ts
rootInjector.create([{
    provide: Car,
    useFactory: ()=>new Car(),
    deps: []
}])
```

## SkipSelf
> 跳过当前

```ts
rootInjector.create([{
    provide: Car,
    useFactory: ()=>new Car(),
    deps: [new SkipSelf(), CarNum]
}])
```
## Self
> 使用当前

```ts
rootInjector.create([{
    provide: Car,
    useFactory: ()=>new Car(),
    deps: [new Self(), CarNum]
}])
```

## Optional
> 当找不到时，不报错，可以为空

```ts
rootInjector.create([{
    provide: Car,
    useFactory: ()=>new Car(),
    deps: [new Optional(), CarNum]
}])
```

## 组合使用
> 使用当前，并可以为空

```ts
rootInjector.create([{
    provide: Car,
    useFactory: ()=>new Car(),
    deps: [new Self(), new Optional(), CarNum]
}])
```