// import { Dispatch, ActionCreator } from 'redux';
// import * as actionTypes from './actionTypes';
// import API from '../api';
// import actionCreator from './actionCreator';
// import { RecordType } from '../types';
//
// export const saveUserInfo = actionCreator(actionTypes.USER_INFO);
//
// export const setModalVisible = actionCreator(actionTypes.MODAL_VISIBLE);
//
// export const getRoomInfo = (params: RecordType) => async (
//   dispatch: Dispatch,
//   getState: ActionCreator<never>
// ) => {
//   const {
//     reducers: { userId },
//   } = getState();
//   const { data } = await API.getConfig({ userId, ...params });
//   console.log('=>', data);
//   dispatch(saveUserInfo(<RecordType>data));
// };
