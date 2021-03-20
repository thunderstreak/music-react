import React, { BaseSyntheticEvent } from 'react';
import { ipcRenderer } from 'electron';
import { RouteComponentProps } from 'react-router';
import { autobind } from 'core-decorators';
import { debounce, enhanceConnect } from '../../utils';
import { PropsDispatch } from '../../types';
import { SongType } from '../../api/middleware';

interface AudioHeaderProps extends RouteComponentProps, PropsDispatch {}
interface AudioHeaderState {
  searchSongList: SongType[];
  searchSongShow: boolean;
}

@enhanceConnect('audio')
export default class AudioHeader extends React.Component<
  Partial<AudioHeaderProps>,
  AudioHeaderState
> {
  constructor(
    props: Partial<AudioHeaderProps> | Readonly<Partial<AudioHeaderProps>>
  ) {
    super(props);
    this.state = {
      searchSongList: [],
      searchSongShow: false,
    };
  }

  componentDidMount() {}

  // eslint-disable-next-line react/sort-comp
  @autobind
  @debounce(1000)
  async handlerSearch(e: BaseSyntheticEvent) {
    const { value } = e.target;
    const {
      propsDispatch: { getMusicSearch },
    } = this.props;
    const data = await getMusicSearch(value);
    this.setState({ searchSongList: data, searchSongShow: !!data.length });
  }

  @autobind
  handlerBlur() {
    this.setState({ searchSongShow: false });
  }

  @autobind
  handlerFocus() {
    const { searchSongShow, searchSongList } = this.state as AudioHeaderState;
    const nextSearchSongShow = !!(!searchSongShow && searchSongList.length);
    this.setState({ searchSongShow: nextSearchSongShow });
  }

  @autobind
  handlerPlaySong(data: SongType) {
    const {
      propsDispatch: { getQQMusicPlaySongSrc },
    } = this.props;
    getQQMusicPlaySongSrc(data.songmid);
  }

  handlerOperatorWindow = (type: string) => {
    ipcRenderer.send(`window-${type}`);
  };

  render() {
    const { searchSongList, searchSongShow } = this.state as AudioHeaderState;
    return (
      <section className="hero-gesture">
        <div className="hero-gesture-logo" title="little" />
        <div className="hero-gesture-box">
          <div className="hero-gesture-search">
            <input
              className="hero-gesture-search-ipt"
              type="text"
              placeholder="搜索歌曲/歌手"
              onInput={this.handlerSearch}
              onBlur={this.handlerBlur}
              onFocus={this.handlerFocus}
            />
            {searchSongShow ? (
              <div className="hero-gesture-search-box">
                <ul className="hero-gesture-search-res">
                  {searchSongList.map((x: SongType) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                    <li
                      key={x.docid}
                      className="res-list"
                      onClick={() => this.handlerPlaySong(x)}
                    >
                      {x.singer.length ? x.singer[0].name : x.singername}-
                      {x.songname}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div
          className="hero-gesture-hide hero-gesture-base"
          title="隐藏"
          onClick={() => this.handlerOperatorWindow('min')}
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div
          className="hero-gesture-closed hero-gesture-base"
          title="关闭"
          onClick={() => this.handlerOperatorWindow('close')}
        />
      </section>
    );
  }
}
