import React, { Component } from 'react';
import { autobind } from 'core-decorators';
import throttle from 'lodash/throttle';
import { enhanceConnect } from '../../utils';
import { ISongLyric } from '../../api/middleware';
import { PropsDispatch } from '../../types';

interface LyricProps extends PropsDispatch {
  AudioPlayer: HTMLAudioElement;
  currPlayTime: number;
}

@enhanceConnect('audio')
export default class AudioLyric extends Component<Partial<LyricProps>> {
  scrollWrapper: HTMLDivElement | null | undefined;

  scrollThreshold = 7;

  scrollTranslateY = 0;

  scrollActivate = true;

  scrollIndex = 0;

  scrollTimer: NodeJS.Timeout | undefined;

  componentDidMount() {
    if (this.scrollWrapper) {
      this.scrollWrapper.onscroll = throttle(() => {
        this.scrollTranslateY = 0;
        // if (this.scrollTimer) {
        //   clearTimeout(this.scrollTimer);
        //   return;
        // }
        // this.scrollTimer = setTimeout(() => {
        //   if (this.scrollTimer) {
        //     clearTimeout(this.scrollTimer);
        //   }
        // }, 3000);
      }, 1000);
    }
  }

  @autobind
  handleLyricListRender() {
    const {
      currPlayTime = 0,
      propsState: { currentLyric = [] },
    } = this.props;
    const findIndex = currentLyric.findIndex(
      (x: ISongLyric) => x.lyricTime === currPlayTime
    );
    if (findIndex !== -1) {
      this.scrollIndex = findIndex;
    }
    const endOffset = this.scrollTranslateY * 30;
    const startOffset = (findIndex - this.scrollThreshold) * 30;
    this.scrollTranslateY =
      this.scrollIndex > this.scrollThreshold ? startOffset : endOffset;
    if (this.scrollActivate) {
      // this.wrapper?.scrollTo(0, translateY);
    }
    return (
      <div
        className="hero-box-lyric-wrapper"
        style={{ transform: `translateY(-${this.scrollTranslateY}px)` }}
      >
        {currentLyric.map((x: ISongLyric, i: number) => (
          <div
            data-index={i}
            className={`hero-box-lyric-wrapper-li ${
              i === this.scrollIndex ? 'activate' : ''
            }`}
            key={`${x.lyricTime}-${x.index}`}
          >
            {x.lyric}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { handleLyricListRender } = this;
    return (
      <div
        className="hero-box-lyric"
        ref={(ref) => {
          this.scrollWrapper = ref;
        }}
      >
        {handleLyricListRender()}
      </div>
    );
  }
}
