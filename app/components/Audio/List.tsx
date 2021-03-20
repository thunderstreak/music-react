import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setCurrentSongData } from '../../features/audioSlice';

function AudioList(): JSX.Element {
  const {
    audio: { musicList = [], currentSong },
  } = useSelector((state: RootState) => state);
  const dispatch = useDispatch();
  useEffect(() => {}, []);
  const handlerPlaySong = useCallback((data: any) => {
    dispatch(setCurrentSongData(data));
  }, []);
  return (
    <section className="hero-box-list">
      {musicList.map(
        (x: { singername: string; songname: string; songmid: string }) => {
          const { songmid, singername, songname } = x;
          return (
            <div
              key={songmid}
              className={`hero-box-list-li ${
                songmid === currentSong.songId ? 'activate' : ''
              }`}
              title={songname}
              onDoubleClick={() => handlerPlaySong(x)}
            >
              <div className="hero-box-list-li-song">{singername}</div>
              <div className="hero-box-list-li-name">{songname}</div>
            </div>
          );
        }
      )}
    </section>
  );
}

export default AudioList;
