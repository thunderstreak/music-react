import React, {
  BaseSyntheticEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { transformTime } from '../../utils';
import { ISongLyric, PlayType, TargetValue } from '../../api/middleware';

interface PanelProps extends RouteComponentProps {
  AudioPlayer: HTMLAudioElement;
  currentLyric: ISongLyric[];
  audioVoice: boolean;
  audioIsPlay: boolean;
  audioVoiceVal: number;
  handlerPlayPaused: () => void;
  handlerPlayNextOrPrev: (type: PlayType) => void;
  handlerPlayVoice: () => void;
  handlerChangeVoice: (e: SyntheticEvent<TargetValue>) => void;
  handlerAdjustProgress: (e: BaseSyntheticEvent<MouseEvent>) => void;
}
const initialAudioPlayParams = {
  audioBuffered: 0,
  songDuration: 0,
  currPlayTime: 0,
  audioProgress: 0,
};
function AudioPanel(props: PanelProps): JSX.Element {
  const {
    AudioPlayer,
    currentLyric,
    audioVoice,
    audioIsPlay,
    audioVoiceVal,
    handlerPlayPaused,
    handlerPlayNextOrPrev,
    handlerPlayVoice,
    handlerChangeVoice,
    handlerAdjustProgress,
  } = props;
  const [audioParams, setAudioParams] = useState(initialAudioPlayParams);
  const [lyric, setLyric] = useState<string>('');

  const setCurrentLyric = useCallback(() => {
    for (let i = 0; i < currentLyric.length; i += 1) {
      if (currentLyric[i].lyricTime === audioParams.currPlayTime) {
        setLyric(currentLyric[i].lyric);
        break;
      }
    }
  }, [audioParams.currPlayTime, currentLyric]);

  useEffect(() => {
    AudioPlayer.ontimeupdate = () => {
      if (AudioPlayer.readyState === 4) {
        // 歌曲缓冲百分值
        const audioBuffered = Math.round(
          (AudioPlayer.buffered.end(0) / AudioPlayer.duration) * 100
        );
        const songDuration = AudioPlayer.duration; // 音乐总时长(秒)

        // 根据当前播放时间设置播放进度条百分值元素
        const currPlayTime = parseInt(String(AudioPlayer.currentTime), 10);
        const audioProgress = parseFloat(
          String((currPlayTime / songDuration) * 100)
        );
        setCurrentLyric();
        setAudioParams({
          ...audioParams,
          audioBuffered,
          songDuration,
          currPlayTime,
          audioProgress,
        });
      }
    };
  }, [AudioPlayer, audioParams, currentLyric, setCurrentLyric]);
  const {
    audioBuffered,
    songDuration,
    currPlayTime,
    audioProgress,
  } = audioParams;
  return (
    <div className="hero-play-panel">
      <div className="hero-play-time">
        <div className="hero-play-time-current">
          {transformTime(currPlayTime)}
        </div>
        <div className="hero-play-time-lyric">
          <span>{lyric}</span>
        </div>
        <div className="hero-play-time-total">
          {transformTime(songDuration)}
        </div>
      </div>
      {/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className="hero-play-progress" onClick={handlerAdjustProgress}>
        <div
          className="hero-play-progress-buffered"
          style={{ width: `${audioBuffered}%` }}
        />
        <div
          className="hero-play-progress-bar"
          style={{ width: `${audioProgress}%` }}
        />
      </div>
      <div className="hero-play-controls">
        <div className="hero-play-controls-left">
          <div
            className="hero-play-controls-playprev"
            title="上一首"
            onClick={() => handlerPlayNextOrPrev('prev')}
          />
          <div
            className={`hero-play-controls-playpaused ${
              audioIsPlay ? 'paused' : 'play'
            }`}
            title="播放"
            onClick={handlerPlayPaused}
          />
          <div
            className="hero-play-controls-playnext"
            title="下一首"
            onClick={() => handlerPlayNextOrPrev('next')}
          />
          <div
            className={`hero-play-controls-playvoice voice-${
              audioVoice ? 'off' : 'on'
            }`}
            title="禁音"
            onClick={handlerPlayVoice}
          />
          <div className="hero-play-controls-playrange">
            <input
              style={{ backgroundSize: `${audioVoiceVal}% 100%` }}
              className="playrange-input iptrange"
              type="range"
              max="100"
              min="0"
              step="1"
              value={audioVoiceVal}
              onChange={handlerChangeVoice}
            />
          </div>
        </div>
        <div className="hero-play-controls-right">
          <div className="hero-play-controls-like like" title="喜欢" />
          <div className="hero-play-controls-hate" title="讨厌" />
          <div className="hero-play-controls-other" title="更多" />
        </div>
      </div>
    </div>
  );
}

export default withRouter(AudioPanel);
