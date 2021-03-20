export interface QQMusicSearchKeyWords {
  w: string;
}
export const transformGeneralKeyWordsToAppointSearchKeyWords = (
  params: string
): QQMusicSearchKeyWords => {
  return { w: params };
};
export const transformGeneralSongInfoToAppointSongData = (
  data: any
): ISongInfo => {
  return {
    songId: data.songmid,
    songSrc: '',
    standbySongSrc: '',
    songName: data.songname,
    singerName: data.singer.map((res: { name: string }) => res.name).join('-'),
    albumSrc: `http://imgcache.qq.com/music/photo/album_300/${
      data.albumid % 100
    }/300_albumpic_${data.albumid}_0.jpg`,
  };
};
export interface ISongLyric {
  lyric: string;
  lyricTime: number;
}
export interface QQMusicParams {
  type?: string;
  topId?: string | number;
}
export type SongId = string | number;
export interface ISongInfo {
  channel?: string;
  songId: number | string;
  songSrc: string;
  standbySongSrc: string;
  songName: string;
  singerName: string;
  albumSrc: string;
}
export type PlayType = 'next' | 'prev';
export interface TargetValue {
  value?: string | number;
}
export interface SongType {
  songmid: number;
  songname: string;
  singername: string;
  singer: any[];
  docid: number;
}
export default {};
