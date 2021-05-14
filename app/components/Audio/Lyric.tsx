import React, { Component } from 'react';
import { enhanceConnect } from '../../utils';
import { ISongLyric } from '../../api/middleware';
import { PropsDispatch } from '../../types';

interface LyricProps extends PropsDispatch {
  AudioPlayer: HTMLAudioElement;
  currPlayTime: number;
}

@enhanceConnect('audio')
export default class AudioLyric extends Component<Partial<LyricProps>> {
  render() {
    const {
      currPlayTime,
      propsState: { currentLyric = [] },
    } = this.props;
    return (
      <div className="hero-box-lyric">
        {currentLyric.map((x: ISongLyric) => (
          <div
            className={`hero-box-lyric-li ${
              currPlayTime === x.lyricTime ? 'activate' : ''
            }`}
            key={`${x.lyricTime}-${x.index}`}
          >
            {x.lyric}
          </div>
        ))}
      </div>
    );
  }
}
