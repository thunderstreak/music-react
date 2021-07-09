import { SongId } from './middleware';

export const QQMusicListParams = {
  g_tk: '5381',
  uin: '0',
  format: 'json',
  inCharset: 'utf-8',
  notice: '0',
  platform: 'h5',
  needNewCode: '1',
  tpl: '3',
  page: 'detail',
  type: 'top', // 巅峰榜 top
  topid: '26', // 33:歌手2018,32:音乐人,31:微信分享,30:梦想的声音,29:影视金曲,28:网络歌曲,27:新歌,26:热歌，25:中国新歌声,
  _: new Date().getTime(),
};

export const NewQQMusicListParams = {
  '-': 'recom7964975138997188',
  g_tk: 871964526,
  sign: 'zzaterdirualxff15c4441255ee9ef959d8dacccc3f88',
  loginUin: 0,
  hostUin: 0,
  format: 'json',
  inCharset: 'utf8',
  outCharset: 'utf-8',
  notice: 0,
  platform: 'yqq.json',
  needNewCode: 0,
  data: {
    comm: { ct: 24 },
    category: {
      method: 'get_hot_category',
      param: { qq: '' },
      module: 'music.web_category_svr',
    },
    recomPlaylist: {
      method: 'get_hot_recommend',
      param: { async: 1, cmd: 2 },
      module: 'playlist.HotRecommendServer',
    },
    playlist: {
      method: 'get_playlist_by_category',
      param: { id: 8, curPage: 1, size: 40, order: 5, titleid: 8 },
      module: 'playlist.PlayListPlazaServer',
    },
    new_song: {
      module: 'newsong.NewSongServer',
      method: 'get_new_song_info',
      param: { type: 5 },
    },
    new_album: {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_info',
      param: { area: 1, sin: 0, num: 20 },
    },
    new_album_tag: {
      module: 'newalbum.NewAlbumServer',
      method: 'get_new_album_area',
      param: {},
    },
    toplist: {
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetAll',
      param: {},
    },
    focus: {
      module: 'music.musicHall.MusicHallPlatform',
      method: 'GetFocus',
      param: {},
    },
  },
};

export const QQMusicSearchParams = {
  g_tk: '5381',
  uin: '0',
  format: 'json',
  inCharset: 'utf-8',
  outCharset: 'utf-8',
  notice: '0',
  platform: 'h5',
  needNewCode: '1',
  // w: '',
  zhidaqu: '1',
  catZhida: '1',
  t: '0',
  flag: '1',
  ie: 'utf-8',
  sem: '1',
  aggr: '0',
  perpage: '10',
  n: '50',
  p: '1',
  remoteplace: 'txt.mqq.all',
  _: new Date().getTime(),
};

export const QQMusicInfoParams = {};

export const QQMusicSongLyricParams = {
  callback: 'MusicJsonCallback_lrc',
  pcachetime: '1494070301711',
  g_tk: 5381,
  jsonpCallback: 'MusicJsonCallback_lrc',
  loginUin: 0,
  hostUin: 0,
  format: 'jsonp',
  inCharset: 'utf8',
  outCharset: 'utf-8¬ice=0',
  platform: 'yqq',
  needNewCode: 0,
};

export const QQMusicSongLyricHeaders = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36',
  Accept: '*/*',
  Referer: 'https://y.qq.com/portal/player.html',
  'Accept-Language': 'zh-CN,zh;q=0.8',
  Cookie:
    'pgv_pvid=8455821612; ts_uid=1596880404; pgv_pvi=9708980224; yq_index=0; pgv_si=s3191448576; pgv_info=ssid=s8059271672; ts_refer=ADTAGmyqq; yq_playdata=s; ts_last=y.qq.com/portal/player.html; yqq_stat=0; yq_playschange=0; player_exist=1; qqmusic_fromtag=66; yplayer_open=1',
  Host: 'c.y.qq.com',
};

export const QQMusicSongPlaySrc = (params: SongId) => {
  return {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        guid: '358840384',
        songmid: [params],
        songtype: [0],
        uin: '1443481947',
        loginflag: 1,
        platform: '20',
      },
    },
    comm: {
      uin: '18585073516',
      format: 'json',
      ct: 24,
      cv: 0,
    },
  };
};
