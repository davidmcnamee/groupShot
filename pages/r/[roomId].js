import styled from 'styled-components'
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Canvas from '../../components/Canvas';
import { onInit } from '../../utils/webrtc';
import { handleError } from '../../utils/error';
import { useRouter } from 'next/router'
import ControlBar from '../../components/ControlBar';
import BackgroundBar from '../../components/BackgroundBar';
import FilterBar from '../../components/FilterBar';
import PhotosBar from '../../components/PhotosBar';
import { defaultBackgrounds } from '../../utils/background';
import Loader from '../../components/Loader';
import { log } from '../../utils/log';
import { useStateWithRef } from '../../utils/useStateWithRef';

function Room() {
  const numTimesRan = useRef(0);
  const [peers, setPeers, peerStateRef] = useStateWithRef({}); // stream
  const peersRef = useRef({}); // video, canvas, conn

  const [myId, setMyId] = useState();
  const [order, setOrder] = useState([]);
  const [background, setBackground] = useState(defaultBackgrounds[0]);
  const backgroundRef = useRef();
  const [videoSizes, setVideoSizes] = useState({});
  const [backgroundBarActive, setBackgroundBarActive] = useState(false);
  const [filter, setFilter, filterRef] = useStateWithRef(null);
  const [filterBarActive, setFilterBarActive] = useState(false);
  const [photosBarActive, setPhotosBarActive] = useState(false);
  const [offsets, setOffsets] = useState({});
  const [photos, setPhotos] = useState([]);
  const router = useRouter();
  console.log('running useRouter and my id is ', router.query.roomId)
  const { roomId } = router.query;

  useEffect(() => {
    if(!roomId) return;
    async function init() {
      if(numTimesRan.current !== 0) return;
      numTimesRan.current = 1;
      const myId = uuidv4();
      setMyId(myId);
      setOffsets([myId]);
      setPhotos(Object.keys(localStorage).filter(key => key.match(/^groupshot-img-\d+$/)).map(key => localStorage.getItem(key)));
      console.log('init script. my id: ', myId);

      const { default: Peer } = require('peerjs');
      const peer = new Peer(myId, {
        host: location.hostname,
        port: location.port || (location.protocol === 'https:' ? 443 : 80),
        path: '/peerjs',
        secure: process.env.NEXT_PUBLIC_PEERJS_SECURE === "true",
      });
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // add self to peers
      console.log('adding self to peers');
      setPeers(peers => (
        log('newPeers', {...peers, [myId]: { ...(peers[myId] ?? {}), stream, }})
      ));
      console.log('roomId is ', roomId);
      await onInit(peer, peers, peersRef, setPeers, stream, roomId, order, setOrder,setBackground, setFilter, setPhotos,setOffsets, filterRef);
    }
    init().catch(handleError);
  }, [router]);

  console.log('videoSizes: ', JSON.stringify(videoSizes), ...Object.values(videoSizes).map(s => s.height));
  console.log('order', JSON.stringify(order));
  const orderMap = new Map(order.map((id, idx) => [id, idx]));
  const maxVideoHeight = Math.max(...Object.values(videoSizes).map(s => s.height));
  const maxVideoWidth = Math.max(...Object.values(videoSizes).map(s => s.width));
  const scaleFactor = globalThis?.innerHeight / maxVideoHeight;
  console.log(globalThis?.innerHeight, maxVideoHeight, Math.max(...Object.values(videoSizes).map(s => s.height)), ...Object.values(videoSizes).map(s => s.height));

  console.log('rendering a total of', Object.values(peersRef.current).length, ' people', JSON.stringify(Object.entries(peersRef.current).map(([id, peer]) => [id, Object.keys(peer)])));
  return (
    <CanvasContainer id="canvas-container">
      <BackgroundImg src={background} ref={backgroundRef}/>
      {Object.keys(peers).map(id => {
        if(!peersRef.current[id]) peersRef.current[id] = {};
        return (
          <Canvas key={id} peersRef={peersRef} id={id} data={peers[id]} refs={peersRef.current[id]} order={orderMap[id]} isSelf={id === myId} setVideoSizes={setVideoSizes} scaleFactor={scaleFactor} offset={offsets[id]} filter={filter} filterRef={filterRef} backgroundRef={backgroundRef}/>
        );
      })}
      <ControlBar myId={myId} backgroundRef={backgroundRef} videoSizes={videoSizes} peers={peers} peersRef={peersRef} setBackgroundBarActive={setBackgroundBarActive} setFilterBarActive={setFilterBarActive} setPhotosBarActive={setPhotosBarActive} setPhotos={setPhotos} setOffsets={setOffsets} offsets={offsets} order={order} setOrder={setOrder}/>
      <BackgroundBar isActive={backgroundBarActive} setActive={setBackgroundBarActive} peers={peers} peersRef={peersRef} setBackground={setBackground}/>
      <PhotosBar isActive={photosBarActive} setActive={setPhotosBarActive} peers={peers} peersRef={peersRef} photos={photos} />
      <FilterBar isActive={filterBarActive} setActive={setFilterBarActive} peers={peers} peersRef={peersRef} setFilter={setFilter}/>
      <Loader />
    </CanvasContainer>
  )
}

const BackgroundImg = styled.img`
  height: 100vh;
  position: absolute;
`

const CanvasContainer = styled.div`
  position: relative;
  background-color: black;
  height: 100vh;
  width: 100vw;
`;

export default Room
