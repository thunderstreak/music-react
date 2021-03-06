import axios from 'axios';
import {
  NewQQMusicListParams,
  QQMusicListParams,
  QQMusicSearchParams,
  QQMusicSongLyricHeaders,
  QQMusicSongLyricParams,
  QQMusicSongPlaySrc,
} from './musicParams';
import { SongId } from './middleware';
import { wrapperGet } from './service';
import {
  setExtraExtensionParameter,
  setRequestHeaderDecorator,
} from '../utils/decorator-apply';

class Apis {
  @setExtraExtensionParameter(QQMusicListParams)
  getQQMusicList = wrapperGet(
    'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  );

  @setExtraExtensionParameter(NewQQMusicListParams)
  getNewQQMusicList = wrapperGet('https://u.y.qq.com/cgi-bin/musics.fcg');

  @setExtraExtensionParameter(QQMusicSearchParams)
  getQQMusicSearch = wrapperGet(
    'https://c.y.qq.com/soso/fcgi-bin/client_search_cp'
  );

  @setRequestHeaderDecorator(QQMusicSongLyricHeaders)
  @setExtraExtensionParameter(QQMusicSongLyricParams)
  getQQMusicSongLyric = wrapperGet(
    'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
  );

  // @setExtraExtensionParameter({ format: 'json', })
  // getQQMusicSongPlayBasicSrc = wrapperGet('https://u.y.qq.com/cgi-bin/musicu.fcg')

  // getQQMusicList = (params: QQMusicParams) => {
  //   return axios({
  //     url: 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg',
  //     method: 'get',
  //     params: { ...QQMusicListParams, ...params },
  //   });
  // };

  // getNewQQMusicList = (params: AnyType) => {
  //   return axios({
  //     url: 'https://u.y.qq.com/cgi-bin/musics.fcg',
  //     method: 'get',
  //     params: { ...NewQQMusicListParams, ...params },
  //   });
  // };

  // getQQMusicSearch = (params: QQMusicSearchKeyWords) => {
  //   return axios({
  //     url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp',
  //     method: 'GET',
  //     params: { ...QQMusicSearchParams, ...params },
  //   });
  // };

  // getQQMusicSongLyric = (params: SongId) => {
  //   return axios({
  //     url: `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg`,
  //     method: 'get',
  //     headers: QQMusicSongLyricHeaders,
  //     params: { ...QQMusicSongLyricParams, songmid: params },
  //   });
  // };

  getQQMusicSongPlayBasicSrc = (params: SongId) => {
    return axios({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      method: 'get',
      params: { format: 'json', data: QQMusicSongPlaySrc(params) },
    });
  };

  getQQMusicSongPlayFullSrc = (params: SongId) => {
    return axios({
      url: 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg',
      method: 'get',
      params: {
        cid: `205361747`,
        filename: `C400${params}.m4a`,
        format: `json205361747`,
        guid: '126548448',
        platform: `yqq`,
        songmid: params,
      },
    });
  };
}

export default new Apis();
