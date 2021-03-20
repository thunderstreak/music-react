import React, { BaseSyntheticEvent, Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { autobind } from 'core-decorators';
import { ipcRenderer } from 'electron';
import { enhanceConnect, getElementWidth, parseLyric } from '../utils';
import { PropsDispatch } from '../types';
import AudioHeader from '../components/Audio/Header';
import AudioArea from '../components/audioArea';
import AudioCover from '../components/Audio/Cover';
import AudioPanel from '../components/Audio/Panel';
import AudioList from '../components/Audio/List';
import { PlayType } from '../api/middleware';

interface AudioProps extends RouteComponentProps, PropsDispatch {}
interface AudioState {
  audioVoice: boolean;
  audioIsPlay: boolean;
  audioVoiceVal: number;
}
@enhanceConnect('audio')
class AudioComponent extends Component<Partial<AudioProps>, AudioState> {
  AudioPlayer = {} as HTMLAudioElement;

  AudioCtx = {} as AudioContext;

  constructor(props: Readonly<Partial<AudioProps>>) {
    super(props);
    this.state = {
      audioVoice: false,
      audioIsPlay: true,
      audioVoiceVal: 100,
    };
  }

  componentDidMount() {
    const {
      propsDispatch: { getMusicList, setQQMusicSongLyric },
    } = this.props;
    getMusicList({ type: 'top', topId: 30 });
    // getQQMusicSongLyric('001oGtPo00bUil');

    // 接受主进程事件通知，渲染歌词
    ipcRenderer.on('ipcMainSongLyric', (_event, lyric) => {
      const decodeLyric = parseLyric(lyric);
      setQQMusicSongLyric(decodeLyric);
    });

    this.AudioPlayer = new Audio();
    this.AudioCtx = new window.AudioContext();
    const analyser = this.AudioCtx.createAnalyser();
    const mediaSource = this.AudioCtx.createMediaElementSource(
      this.AudioPlayer
    );
    mediaSource.connect(analyser);
    analyser.connect(this.AudioCtx.destination);
    // const bufferLength = analyser.frequencyBinCount;
    // const dataArray = new Uint8Array(360);
    this.AudioPlayer.addEventListener(
      'ended',
      () => this.handlerPlayNextOrPrev('next'),
      false
    );
  }

  componentDidUpdate(
    _prevProps: Readonly<Partial<AudioProps>>,
    _prevState: Readonly<AudioState>,
    _snapshot?: any
  ) {
    const {
      propsState: { currentSong: nextCurrentSong },
    } = this.props;
    const { AudioPlayer } = this;
    if (AudioPlayer.src !== nextCurrentSong.songSrc) {
      // 获取歌词
      ipcRenderer.send('ipcRendererSongLyric', nextCurrentSong.songId);
      AudioPlayer.src = nextCurrentSong.songSrc;
      AudioPlayer.load();
      AudioPlayer.play().catch(console.log);
      AudioPlayer.addEventListener('play', () => {
        const { audioIsPlay } = this.state;
        if (!audioIsPlay) {
          this.setState({ audioIsPlay: true });
        }
      });
    }
  }

  @autobind
  handlerPlayPaused() {
    const { src, paused } = this.AudioPlayer;
    let audioIsPlay: boolean;
    if (src && paused) {
      this.AudioPlayer.play();
      audioIsPlay = true;
    } else {
      this.AudioPlayer.pause();
      audioIsPlay = false;
    }
    this.setState({ audioIsPlay });
  }

  @autobind
  handlerPlayNextOrPrev(type: PlayType) {
    const {
      propsDispatch: { setNextOrPrevSongData },
    } = this.props;
    setNextOrPrevSongData(type);
  }

  @autobind
  handlerPlayVoice() {
    const { audioVoice } = this.state;
    let voice: boolean;
    let volume: number;
    if (audioVoice) {
      volume = 1;
      voice = false;
    } else {
      volume = 0;
      voice = true;
    }
    this.AudioPlayer.volume = volume;
    this.setState({ audioVoice: voice });
  }

  @autobind
  handlerChangeVoice(e: BaseSyntheticEvent) {
    const {
      currentTarget: { value },
    } = e;
    this.AudioPlayer.volume = value / 100;
    this.setState({ audioVoice: value === 0, audioVoiceVal: value });
  }

  @autobind
  handlerAdjustProgress(e: BaseSyntheticEvent<MouseEvent>) {
    const {
      currentTarget,
      nativeEvent: { offsetX },
    } = e;
    const {
      propsState: { currentLyric },
    } = this.props;
    const { duration } = this.AudioPlayer;
    // 停止播放
    this.AudioPlayer.pause();
    // 获取计算点击位置的进度条百分比值
    const progressTotal = getElementWidth(currentTarget);
    const percentage = offsetX / progressTotal;

    // 指定播放时间开始播放
    this.AudioPlayer.currentTime = parseInt(String(percentage * duration), 10);
    this.AudioPlayer.play().catch(console.log); // 开始播放音乐

    // 拖动进度条显示当前歌词
    const currPlayTime = parseInt(String(this.AudioPlayer.currentTime), 10);
    for (let i = 0; i < currentLyric.length; i += 1) {
      if (
        currentLyric[i].lyricTime <= currPlayTime &&
        currPlayTime <= currentLyric[i + 1].lyricTime
      ) {
        this.currentLyric = currentLyric[i].lyric;
        break;
      }
    }
    // this.albumStartRotate(); // 专辑图片开始旋转
    // this.isPlay = true; // 是否播放状态为播放
  }

  render() {
    const { audioVoice, audioIsPlay, audioVoiceVal } = this.state;
    const {
      propsState: { currentSong = {}, currentLyric },
    } = this.props;
    const { singerName, albumSrc, songName } = currentSong;
    return (
      <div className="hero-box">
        <AudioHeader />
        <AudioArea />
        <AudioCover
          handlerPlayPaused={this.handlerPlayPaused}
          audioIsPlay={audioIsPlay}
          albumSrc={albumSrc}
          singerName={songName}
          songName={singerName}
        />
        <AudioPanel
          currentLyric={currentLyric}
          AudioPlayer={this.AudioPlayer}
          audioVoice={audioVoice}
          audioIsPlay={audioIsPlay}
          audioVoiceVal={audioVoiceVal}
          handlerPlayPaused={this.handlerPlayPaused}
          handlerPlayNextOrPrev={this.handlerPlayNextOrPrev}
          handlerPlayVoice={this.handlerPlayVoice}
          handlerChangeVoice={this.handlerChangeVoice}
          handlerAdjustProgress={this.handlerAdjustProgress}
        />
        <AudioList />
        {/* <Link to={routes.COUNTER}>to Counter {name}</Link> */}
      </div>
    );
  }
}
export default AudioComponent;
