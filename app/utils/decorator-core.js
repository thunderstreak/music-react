import utils from './index';

const { isObject } = utils;

export const createDecorator = (hocWrapper, ...args) => {
  if (typeof hocWrapper !== 'function')
    throw Error(
      '[create-decorator]: createDecorator Please pass in a higher-order function'
    );

  return function handleDescriptor(target, key, descriptor) {
    if (!descriptor && typeof target === 'function') {
      return hocWrapper(target);
    }

    if (descriptor && !isObject(descriptor)) {
      throw Error(
        '[create-decorator]: Descriptor is not a description object. Please check that @decorator is the correct decorator structure: function (target, name, descriptor) { ... }',
        'descriptor: ',
        descriptor
      );
    }

    const { configurable, enumerable } = descriptor;
    const originalGet = descriptor.get;
    const originalSet = descriptor.set;
    let originalValue = descriptor.value;
    const originInitializer = descriptor.initializer;
    const isGetter = !!originalGet;
    const defaultSetter = (newValue) => {
      originalValue = newValue;
    };
    let wrappedFn;

    const desc = {
      configurable,
      enumerable,
    };

    // 当非箭头函数 或 静态箭头函数时候, 不能有即有initializer 和 value(get、set)属性
    // 构建报错如(Invalid property descriptor Cannot both specify accessor and a value or writable attribute)
    // 所以这里将initializer 与 get set区分开
    if (typeof originInitializer === 'function') {
      desc.initializer = function initializer() {
        if (!wrappedFn) {
          // 这边在编译时候, 将this传入作用域curry起来, 等于间接固定了this
          // 这个realMethod是类中的具体执行业务逻辑的函数
          const realMethod = originInitializer.call(this).bind(this);
          // 这个是通过高阶函数装饰之后的代理函数, 调用者调用的就是这个函数
          wrappedFn = hocWrapper.call(this, realMethod, ...args);
        }
        return function realMethodCall(...nextArgs) {
          return wrappedFn.call(this, ...nextArgs);
        };
      };
    } else {
      desc.get = function get() {
        if (wrappedFn) return wrappedFn;

        let realMethod;
        if (isGetter) {
          realMethod = originalGet.call(this).bind(this);
        } else if (typeof originalValue === 'function') {
          realMethod = originalValue.bind(this);
        } else {
          throw Error(
            "[create-decorator]: descriptor's `value` or `get` property is not a function",
            descriptor
          );
        }

        wrappedFn = hocWrapper.call(this, realMethod, ...args);
        return wrappedFn;
      };
      desc.set = isGetter ? originalSet : defaultSetter;
    }

    return desc;
  };
};

export const compose = (...functions) => {
  if (functions.length === 0) {
    return (arg) => arg;
  }

  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduce((a, b) => (...args) => a(b(...args)));
};
