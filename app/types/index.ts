import { ConnectedComponent, GetProps, Shared } from 'react-redux';
import React from 'react';
import { Dispatch } from 'redux';

export interface AnyType<T = any> {
  [name: string]: T;
}

export type RecordType = Record<string, unknown>;

export type ActionType = {
  type: string;
  payload: RecordType;
};

export type PropsState = AnyType;
export type PropsDispatch = AnyType;

export function spreadAssign<T extends RecordType>(t: any): T {
  return { ...(t as RecordType) } as T;
}
export type Retype = (
  reducer?: string
) => (target: React.ComponentClass) => EnhanceConnectType;

export type EnhanceConnectType = ConnectedComponent<
  React.ComponentClass,
  Omit<
    GetProps<React.ComponentClass>,
    keyof Shared<
      { propsState: RecordType } & {
        propsDispatch: AnyType;
        dispatch: Dispatch;
      },
      GetProps<React.ComponentClass>
    >
  >
>;
