import * as actionTypes from './actionTypes';
import { ActionType, RecordType } from '../types';

const initialState: RecordType = {
  modalVisible: false,
  userId: '',
  userInfo: {
    nick: 'nick',
  },
  isLiveEnd: false,
};

export default function reducer(state = initialState, action: ActionType) {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.USER_INFO:
      return {
        ...state,
        userInfo: { ...(state.userInfo as RecordType), ...payload },
      };
    case actionTypes.SET_LIVE_END:
      return { ...state, isLiveEnd: !!payload };
    case actionTypes.MODAL_VISIBLE:
      return { ...state, modalVisible: !!payload };
    default:
      return state;
  }
}
