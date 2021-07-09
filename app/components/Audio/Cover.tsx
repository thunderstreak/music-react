import React, { createRef } from 'react';
import { autobind } from 'core-decorators';

interface AudioCoverProps {
  albumSrc: string;
  songName: string;
  singerName: string;
  audioIsPlay: boolean;
  handlerPlayPaused: () => void;
}
interface AudioCoverState {
  albumRotateDeg: number;
}
class AudioCover extends React.PureComponent<AudioCoverProps, AudioCoverState> {
  albumImgEle: React.RefObject<HTMLImageElement>;

  albumInterval: number | null | undefined;

  constructor(props: AudioCoverProps | Readonly<AudioCoverProps>) {
    super(props);
    this.state = {
      albumRotateDeg: 0,
    };
    this.albumImgEle = createRef<HTMLImageElement>();
    this.albumInterval = null;
  }

  componentDidMount() {
    this.handlerAlbumStartRotate();
  }

  componentDidUpdate(
    prevProps: Readonly<AudioCoverProps>,
    _prevState: Readonly<AudioCoverState>
  ) {
    const { audioIsPlay: PrevAudioIsPlay } = prevProps;
    const { audioIsPlay: NextAudioIsPlay } = this.props;
    if (PrevAudioIsPlay !== NextAudioIsPlay) {
      if (NextAudioIsPlay) {
        this.handlerAlbumStartRotate();
      } else if (this.albumInterval != null) {
        cancelAnimationFrame(this.albumInterval);
      }
    }
  }

  componentWillUnmount() {
    if (this.albumInterval != null) {
      cancelAnimationFrame(this.albumInterval);
    }
  }

  @autobind
  handlerAlbumStartRotate() {
    const { albumRotateDeg } = this.state as AudioCoverState;
    this.albumInterval = window?.requestAnimationFrame(
      this.handlerAlbumStartRotate
    );
    const { current } = this.albumImgEle;
    if (current) {
      current.style.transform = `rotate(${albumRotateDeg}deg)`;
    }
    this.setState({ albumRotateDeg: albumRotateDeg + 0.5 });
    if (albumRotateDeg > 360) {
      this.setState({ albumRotateDeg: 0 });
    }
  }

  render() {
    const { albumSrc = '', songName = '', singerName = '' } = this.props;
    const { handlerPlayPaused } = this.props;
    return (
      <div className="hero-play-audio">
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
        <img
          onClick={handlerPlayPaused}
          ref={this.albumImgEle}
          className="hero-play-audios"
          draggable="false"
          src={albumSrc}
          alt=""
        />
        <div className="hero-play-album-name">{`${songName}-${singerName}`}</div>
      </div>
    );
  }
}
export default AudioCover;
