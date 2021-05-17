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
  wrapper: HTMLDivElement | null | undefined;

  scrollThreshold = 7;

  scrollActivate = true;

  scrollTimer: NodeJS.Timeout | undefined;

  componentDidMount() {
    if (this.wrapper) {
      this.wrapper.onscroll = throttle((e: Event) => {
        console.log(e.currentTarget);

        // this.scrollActivate = false;
        // this.scrollTimer = setTimeout(() => {
        //   this.scrollActivate = true;
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
    let tempIndex = 0;
    const findIndex = currentLyric.findIndex(
      (x: ISongLyric) => x.lyricTime > currPlayTime
    );
    if (findIndex !== -1) {
      tempIndex = findIndex - 1;
    }
    const translateY =
      tempIndex > this.scrollThreshold
        ? (tempIndex - this.scrollThreshold) * 30
        : 0;
    if (this.scrollActivate) {
      this.wrapper?.scrollTo(0, translateY);
    }
    return (
      <div className="hero-box-lyric-wrapper">
        {currentLyric.map((x: ISongLyric, i: number) => (
          <div
            className={`hero-box-lyric-wrapper-li ${
              i === tempIndex ? 'activate' : ''
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
          this.wrapper = ref;
        }}
      >
        {handleLyricListRender()}
      </div>
    );
  }
}
