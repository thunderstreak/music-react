import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const requestConfigInterceptors = (config: AxiosRequestConfig) => {
  return config;
};
export const requestErrorInterceptors = (error: AxiosError) => {
  return Promise.reject(error);
};

export const responseDataInterceptors = (response: AxiosResponse) => {
  return response;
};
export const responseErrorInterceptors = (error: AxiosError) => {
  return Promise.reject(error);
};
