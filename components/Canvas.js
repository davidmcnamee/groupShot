import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Video from '../components/Video';
import { startLoop, stopLoop } from '../utils/bodypix';
import ReactDOM from 'react-dom';

const Canvas = ({ id, refs, peersRef, data, setVideoSizes, scaleFactor, isSelf, offset, order, filterRef, filter, backgroundRef }) => {
  const [filterComps, setFilterComps] = useState([]);
  refs.setFilterComps = setFilterComps;
  
  console.log('rendering canvas with stream: ', data.stream);
  function onLoadedData() {
    console.log('loading data for id: ', id);
    startLoop(id, {curPeer:data, peerRef: refs, peersRef, filterRef});
  }
  useEffect(() => {
    const video = refs.video;
    function resizeVideo() {
      console.log('setting video width');
      video.width = video.videoWidth;
      video.height = video.videoHeight;
      setVideoSizes(videoSizes => (
        {...videoSizes, [id]: {
          width: video.videoWidth,
          height: video.videoHeight,
        }}
      ));
      video.removeEventListener('playing', resizeVideo);
    }
    video.addEventListener("playing", resizeVideo);
    console.log('setting video stream');
    video.srcObject = data.stream;
    video.muted = isSelf;
    video.play();
    return () => {
      stopLoop(id);
      setVideoSizes(videoSizes => {
        const newVideoSizes = {...videoSizes};
        delete newVideoSizes[id];
        return newVideoSizes;
      });
    }
  }, [])

  let canvasWidth = refs.video?.width * scaleFactor;
  let canvasHeight = refs.video?.height * scaleFactor;
  if(isNaN(canvasWidth)) canvasWidth = 0;
  if(isNaN(canvasHeight)) canvasHeight = 0;

  console.log('scaleFactor', scaleFactor);

  return (
    <>
      <StyledCanvas ref={obj => refs.canvas = obj} width={refs.video?.width} height={refs.video?.height} outsideWidth={canvasWidth} outsideHeight={canvasHeight} offset={offset} order={order}/>
      {filter && filter.render({filterComps, zIndex: order === undefined ? 500 : 501+order, scaleFactor, backgroundRef, offset})}
      {ReactDOM.createPortal(<StyledVideo ref={obj => refs.video = obj} onLoadedData={onLoadedData} autoPlay />, document.body)}
    </>
  )
}

const StyledCanvas = styled.canvas`
  position: absolute;
  bottom: 0;
  height: ${p => p.outsideHeight}px;
  width: ${p => p.outsideWidth}px;
  background-color: transparent;
  z-index: 800;
  transform: translate(${p => p.offset?.x ?? 0}px,${p => p.offset?.y ?? 0}px);
  z-index: ${p => p.order === undefined ? 500 : 501+p.order};
`;

const StyledVideo = styled.video`
  position: fixed;
  left: 100%;
  right: 100%;
`

export default Canvas;
