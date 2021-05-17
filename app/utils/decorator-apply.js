import { createDecorator } from './decorator-core';

// loading decorator
export const getLoadingDecorator = (loadingService) =>
  createDecorator((fn) => (...args) => {
    let instance;
    if (loadingService) {
      const { show } = loadingService;
      instance = show();
    }
    return fn(...args).finally(() => instance && instance.close());
  });

// success or error message notify
export const getMessageDecorator = (toast) => ({
  successMsg,
  errorMsg,
} = {}) => {
  const alert = typeof window !== 'undefined' ? window.alert : console.log;
  const getToast = (name) =>
    typeof toast === 'object' && typeof toast[name] === 'function'
      ? toast[name]
      : alert;
  const messageGetter = (msg) => (typeof msg === 'function' ? msg : (_) => msg);
  const successToast = getToast('success');
  const errorToast = getToast('error');
  const getSuccessMsg = messageGetter(successMsg);
  const getErrorMsg = messageGetter(errorMsg);

  return createDecorator((fn) => (...args) => {
    return (
      typeof fn === 'function' &&
      fn(...args).then(
        (res) => {
          const msg = getSuccessMsg(res);
          if (msg) {
            successToast(msg);
          }
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.resolve(res);
        },
        (err) => {
          const msg = getErrorMsg(err);
          if (msg) {
            errorToast(msg);
          }
          // eslint-disable-next-line promise/no-return-wrap
          return Promise.reject(err);
        }
      )
    );
  });
};

// request log
export const setRequestLogDecorator = createDecorator(
  (fn) => async (...args) => {
    const name = fn ? fn.name : 'anonymity';
    console.log(`[log] ${name} before: `, ...args);
    const result = await fn(...args);
    console.log(`[log] ${name} after: `, result);
    return result;
  }
);

// mock decorator
export const getMockDecorator = (mockFn) =>
  createDecorator((apiFn) => (...args) => {
    if (process.env.NODE_ENV === 'development') {
      return mockFn(...args);
    }
    return apiFn(...args);
  });

// set request header config
export const setRequestHeaderDecorator = (...headers) =>
  createDecorator((fn) => (...args) => {
    return fn(...[...args, { headers }]);
  });

// set request delay
export const setDelayDecorator = (wait) =>
  createDecorator((fn) => (...args) => {
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn(...args));
        }, wait || 0);
      });
    }
    return fn(...args);
  });

// set response transform to target data
export const setResponseData = (handle) =>
  createDecorator((fn) => async (...args) => {
    const data = await fn(...args);
    return handle(data);
  });

// del confirm decorator
export const getConfirmDecorator = (...config) => (handle) =>
  createDecorator((fn) => async (...args) => {
    const confirm = await handle(...config);
    if (confirm) {
      const res = fn(...args);
      if (typeof res === 'function') {
        return res();
      }
      return res;
    }
    return null;
  });

export const setExtraExtensionParameter = (...extras) =>
  createDecorator((fn) => (...args) => fn(...[...args, { extras }]));
