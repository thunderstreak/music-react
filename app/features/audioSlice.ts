import { createSlice } from '@reduxjs/toolkit';
import { AppThunk } from '../store/store';
import Apis from '../api';
import {
  PlayType,
  QQMusicParams,
  SongId,
  ISongInfo,
  SongType,
  transformGeneralKeyWordsToAppointSearchKeyWords,
  transformGeneralSongInfoToAppointSongData,
  ISongLyric,
  IListSongInfo,
  IPlayParams,
} from '../api/middleware';

const audioSlice = createSlice({
  name: 'audio',
  initialState: {
    musicList: [] as IListSongInfo[],
    musicSearch: [] as IListSongInfo[],
    currentLyric: [] as ISongLyric[],
    currentSong: {} as ISongInfo,
    currentPlay: {} as IPlayParams, // 当前播放的一些参数
  },
  reducers: {
    setMusicSongLyric: (state, { payload }) => {
      state.currentLyric = payload;
    },
    setMusicList: (state, { payload }) => {
      state.musicList = [...state.musicList, ...payload];
    },
    setMusicSearch: (state, { payload }) => {
      state.musicSearch = payload;
    },
    setCurrentSong: (state, { payload }) => {
      state.currentSong = { ...state.currentSong, ...payload };
    },
    setCurrentPlay: (state, { payload }) => {
      state.currentPlay = { ...state.currentPlay, ...payload };
    },
  },
});

const {
  setMusicSongLyric,
  setMusicList,
  setMusicSearch,
  setCurrentSong,
  setCurrentPlay,
} = audioSlice.actions;

export const getMusicSearch = (params: string): AppThunk => async (
  dispatch
) => {
  const transformParams = transformGeneralKeyWordsToAppointSearchKeyWords(
    params
  );
  const {
    data: {
      data: {
        song: { list = [] },
      },
    },
  } = await Apis.getQQMusicSearch(transformParams);
  dispatch(setMusicSearch(list));
  return list;
};

export const setQQMusicSongLyric = (params: ISongLyric): AppThunk => async (
  dispatch
) => {
  dispatch(setMusicSongLyric(params));
};

// 获取歌词
export const getQQMusicSongLyric = (params: SongId): AppThunk => async (
  dispatch
) => {
  const { data } = await Apis.getQQMusicSongLyric({ songmid: params });
  dispatch(setMusicSongLyric(data));
};

const getQQMusicPlaySongSrc = async (params: SongId) => {
  const { data: BasicSrcData } = await Apis.getQQMusicSongPlayBasicSrc(params);
  const { data: FullSrcData } = await Apis.getQQMusicSongPlayFullSrc(params);

  const {
    req_0: {
      data: { sip = [], midurlinfo = [] },
    },
  } = BasicSrcData;
  const {
    data: { items },
  } = FullSrcData;

  const [url1, url2] = sip;
  const { purl } = midurlinfo[0];
  let songSrc: string;
  let standbySongSrc: string;
  if (purl) {
    songSrc = `${url1}${purl}`;
    standbySongSrc = `${url2}${purl}`;
  } else {
    const { filename, vkey } = items[0];
    songSrc = `${url1}${filename}?guid=126548448&vkey=${vkey}&uin=0&fromtag=66`;
    standbySongSrc = `${url2}${filename}?guid=126548448&vkey=${vkey}&uin=0&fromtag=66`;
  }
  return { songSrc, standbySongSrc };
};

export const getMusicList = (params: QQMusicParams): AppThunk => async (
  dispatch
) => {
  const {
    data: { songlist },
  } = await Apis.getQQMusicList(params);
  const usableList = songlist
    .map((x: IListSongInfo) => x.data)
    .filter((x: IListSongInfo) => x.pay.payplay !== 1);

  dispatch(setMusicList(usableList));
  const transformSongData = transformGeneralSongInfoToAppointSongData(
    usableList[0]
  );
  const srcData = await getQQMusicPlaySongSrc(transformSongData.songId);
  dispatch(setCurrentSong({ ...transformSongData, ...srcData }));
};

export const setNextOrPrevSongData = (type: PlayType): AppThunk => async (
  dispatch,
  getState
) => {
  const {
    audio: {
      musicList,
      currentSong: { songId },
    },
  } = getState();
  const index = musicList.findIndex(
    (x: { songmid: string }) => x.songmid === songId
  );
  const indexType = type === 'next' ? index + 1 : index - 1;
  const nextSong = indexType > musicList.length ? musicList.length : indexType;
  const transformSongData = transformGeneralSongInfoToAppointSongData(
    musicList[nextSong]
  );
  const srcData = await getQQMusicPlaySongSrc(transformSongData.songId);
  dispatch(setCurrentSong({ ...transformSongData, ...srcData }));
};

export const setCurrentSongData = (data: SongType): AppThunk => async (
  dispatch
) => {
  const transformSongData = transformGeneralSongInfoToAppointSongData(data);
  const srcData = await getQQMusicPlaySongSrc(transformSongData.songId);
  dispatch(setCurrentSong({ ...transformSongData, ...srcData }));
};

export const setCurrentPlayParams = (data: IPlayParams): AppThunk => async (
  dispatch
) => {
  dispatch(setCurrentPlay(data));
};

export default audioSlice.reducer;
