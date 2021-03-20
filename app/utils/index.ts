import {
  bindActionCreators,
  StateFromReducersMapObject,
  Dispatch,
} from 'redux';
import { connect } from 'react-redux';
import { ComponentClass } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import { withRouter } from 'react-router';
import { spreadActions } from '../features';
import { AnyType, EnhanceConnectType, spreadAssign } from '../types';
import { ISongLyric } from '../api/middleware';

export const enhanceConnect: any = (reducer = '') => (
  target: ComponentClass
): EnhanceConnectType => {
  return connect(
    (state: StateFromReducersMapObject<AnyType>) => {
      const propsState = spreadAssign(state[reducer] ? state[reducer] : state);
      return { propsState };
    },
    (dispatch: Dispatch) => {
      const actions = spreadActions(reducer);
      const propsDispatch: AnyType = {};
      Object.keys(actions).forEach((x) => {
        propsDispatch[x] = bindActionCreators(actions[x], dispatch);
      });
      return { propsDispatch, dispatch };
    }
  )(target);
};

export const enhanceWithRouter: any = () => withRouter;

export const actionCreator = (type: string) => (payload: PayloadAction) =>
  !payload ? { type, payload } : { type };

export const debounce = (wait: number) => (
  _target: any,
  _name: string,
  descriptor: any
) => {
  const fn = descriptor.value;
  let timer: any = null;
  descriptor.value = function (...args: any[]) {
    const e = args[0];
    e.persist();
    clearTimeout(timer);
    timer = setTimeout(() => {
      return fn.apply(this, args);
    }, wait);
  };
  return descriptor;
};

export const throttle = (delay: number) => (
  _target: any,
  _name: string,
  descriptor: any
) => {
  const fn = descriptor.value;
  let timer: NodeJS.Timeout | number | null = null;
  descriptor.value = function (...args: any[]) {
    const e = args[0];
    e.persist();
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        return fn.apply(this, args);
      }, delay);
    }
  };
  return descriptor;
};

export const autoBind = (_target: any, _name: string, descriptor: any) => {
  const fn = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const constructor = Reflect.construct(_target.constructor, args);
    return fn.apply(constructor, args);
  };
};

export const getTime = (str: string) => {
  const splitColon = str.split(':');
  const splitDit = str.split('.');
  const minutes = parseInt(splitColon[0], 10);
  const seconds = parseInt(splitColon[1].split('.')[0], 10);
  const ms = parseInt(splitDit[1], 10);
  return Math.floor(minutes * 60 + seconds + ms / 100);
};

export const transformTime = (time: number) => {
  const second = parseInt(String(time), 10);
  const minute = parseInt(String(second / 60), 10);
  if (second % 60 < 10) {
    return `${minute}:0${second % 60}`;
  }
  return `${minute}:${second % 60}`;
};

export const parseLyric = (lyric: string): ISongLyric[] => {
  const playSongLyric: ISongLyric[] = [];
  if (lyric.length === 0) {
    playSongLyric.push({
      lyric: '当前暂无歌词显示',
      lyricTime: 0,
    });
    return playSongLyric;
  }
  for (let i = 1; i < lyric.length; i += 1) {
    if (lyric[i]) {
      if (lyric[i].split('[')[1].split(']')[1]) {
        playSongLyric.push({
          lyric: lyric[i].split('[')[1].split(']')[1],
          lyricTime: getTime(lyric[i].split('[')[1].split(']')[0]),
        });
      }
    }
  }
  return playSongLyric;
};

export const getElementWidth = (element: EventTarget | null): number => {
  const e: CSSStyleDeclaration = window.getComputedStyle(<Element>element);
  return parseInt(e.width.replace('px', ''), 10);
};

const isType = (type: string) => (value: any) =>
  Object.prototype.toString.call(value).includes(type);
export default {
  isArray: isType('Array'),
  isObject: isType('Object'),
  isFunction: isType('Function'),
  isNull: isType('Null'),
  isUndefined: isType('Undefined'),
  isNumber: isType('Number'),
  isString: isType('String'),
  isBoolean: isType('Boolean'),
};
