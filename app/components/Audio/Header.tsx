import React, { BaseSyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
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
  searchValue?: string;
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
      searchValue: '',
    };
  }

  componentDidMount() {}

  handlerOperatorWindow = (type: string) => {
    ipcRenderer.send(`window-${type}`);
  };

  @autobind
  handlerInput(e: BaseSyntheticEvent) {
    const { value } = e.target;
    this.setState({ searchValue: value });
  }

  @autobind
  @debounce(1000)
  async handlerSearch(e: BaseSyntheticEvent) {
    const { value } = e.target;
    const {
      propsDispatch: { getMusicSearch },
    } = this.props;
    const data = await getMusicSearch(value);
    this.setState({
      searchSongList: data,
      searchSongShow: !!data.length,
    });
  }

  @autobind
  handlerHideList(event: BaseSyntheticEvent) {
    event.persist();
    event.stopPropagation();
    const {
      target: { tagName },
    } = event;
    if (tagName === 'DIV') {
      this.setState({ searchSongShow: false });
    }
  }

  @autobind
  handlerFocus() {
    const { searchSongShow, searchSongList } = this.state;
    const nextSearchSongShow = !!(!searchSongShow && searchSongList.length);
    this.setState({ searchSongShow: nextSearchSongShow });
  }

  @autobind
  handlerPlaySong(data: SongType) {
    const {
      propsDispatch: { setCurrentSongData },
    } = this.props;
    setCurrentSongData(data);
    this.setState({ searchSongShow: false, searchValue: data.songname });
  }

  render() {
    const { searchSongList, searchSongShow, searchValue } = this.state;
    return (
      <div className="hero-gesture">
        <div className="hero-gesture-logo" title="little" />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div className="hero-gesture-box" onClick={this.handlerHideList}>
          <div className="hero-gesture-search">
            <input
              className="hero-gesture-search-ipt"
              type="text"
              placeholder="搜索歌曲/歌手"
              value={searchValue}
              onInput={this.handlerInput}
              onChange={this.handlerSearch}
              onFocus={this.handlerFocus}
            />
          </div>
        </div>
        {searchSongShow
          ? createPortal(
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
              <div className="hero-song-list" onClick={this.handlerHideList}>
                <ul className="hero-song-list-res">
                  {searchSongList.map((x: SongType) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
                    <li
                      key={x.docid}
                      className="hero-song-list-res-list"
                      onDoubleClick={() => this.handlerPlaySong(x)}
                    >
                      {x.singer.length ? x.singer[0].name : x.singername}-
                      {x.songname}
                    </li>
                  ))}
                </ul>
              </div>,
              window.document.body
            )
          : null}
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
      </div>
    );
  }
}
