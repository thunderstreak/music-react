import axios from 'axios';
import { omit } from 'lodash';
import utils from '../utils';
import { AnyType, RequestParamsType } from '../types';
import {
  requestConfigInterceptors,
  requestErrorInterceptors,
  responseDataInterceptors,
  responseErrorInterceptors,
} from './interceptors';

const { isObject, isArray } = utils;

const service = axios.create({
  timeout: 100000,
});
const { get, post } = service;

service.interceptors.request.use(
  requestConfigInterceptors,
  requestErrorInterceptors
);
service.interceptors.response.use(
  responseDataInterceptors,
  responseErrorInterceptors
);

const handlerRequestParams = (params: RequestParamsType): AnyType => {
  let data = {};
  if (isObject(params)) {
    const { headers = {} } = params;
    data = headers ? omit(params, 'headers') : params;
  } else if (isArray(params)) {
    // 针对传入多个参数的情况需要合并成一个参数
    data = params.reduce(
      (prev: { [x: string]: any }, curr: { [x: string]: any }) => {
        Object.keys(curr).forEach((key) => {
          prev[key] = curr[key];
        });
        return prev;
      },
      {}
    );
  }
  return data;
};
const handlerSetHeader = (data: RequestParamsType = {}): AnyType => {
  let headers = {};
  if (data && data.headers) {
    headers = { headers: data.headers };
  }
  return headers;
};

export const wrapperGet = (url: string) => (...params: RequestParamsType[]) => {
  return get(url, {
    params: handlerRequestParams(params),
    headers: handlerSetHeader(params),
  });
};

export const wrapperPost = (url: string) => (...data: RequestParamsType[]) =>
  post(url, handlerRequestParams(data), { headers: handlerSetHeader(data) });

export const wrapperFormPost = (url: string) => (
  ...data: RequestParamsType[]
) => {
  const formData = new FormData();
  const resData = handlerRequestParams(data);
  Object.keys(resData).forEach((key) => formData.append(key, resData[key]));
  return post(url, formData, { headers: handlerSetHeader(data) });
};

export const wrapperPostParams = (url: string) => (
  ...params: RequestParamsType[]
) =>
  post(url, null, {
    params: handlerRequestParams(params),
    headers: handlerSetHeader(params),
  });

export default service;
