import axios from 'axios';
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

const handlerArrayToObject = (data: AnyType) =>
  data.reduce(
    (prev: { [x: string]: unknown }, curr: { [x: string]: unknown }) => {
      Object.keys(curr).forEach((x: string) => {
        prev[x] = curr[x];
      });
      return prev;
    },
    {}
  );
const handlerRequestParams = (data: RequestParamsType[]): AnyType => {
  const [first, ...other] = data;
  let temp = {} as RequestParamsType;
  let params = {};

  // 针对传入的额外扩展参数和header参数统一合并
  if (other.length) {
    temp = handlerArrayToObject(other);
    if (temp.extras) {
      temp.extras = { ...handlerArrayToObject(temp.extras) };
    }
  }

  if (isArray(first)) {
    params = first.map((x: AnyType) => ({ ...x, ...temp.extras }));
  } else if (isObject(first)) {
    params = { ...first, ...temp.extras };
  }
  return params;
};
const handlerSetHeader = (data: RequestParamsType[]): AnyType => {
  const other = data.splice(1);
  const params = handlerArrayToObject(other);
  let headers = {};
  if (params.headers) {
    headers = { ...handlerArrayToObject(params.headers) };
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
