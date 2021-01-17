import { useState,useEffect } from 'react';
import styled from 'styled-components';
import ExitIcon from './Icons/Exit';
import YourPhotosIcon from './Icons/YourPhotos';
import BackgroundIcon from './Icons/Background';
import MoveIcon from './Icons/Move';
import TakePhotoIcon from './Icons/TakePhoto';
import FilterIcon from './Icons/Filter';
import { handleError } from '../utils/error';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const ControlBar = ({ myId, peers, peersRef, videoSizes, backgroundRef, setBackgroundBarActive, setFilterBarActive, setPhotosBarActive, offsets, setOffsets, order, setOrder, setPhotos }) => {
  const [isActive, setActive] = useState(true);
  const setActiveTrue = () => setActive(active => !active ? true : active);
  const setActiveFalse = debounce(() => setActive(active => active ? false : active), 1200);
  const router = useRouter();
  
  useEffect(() => {
    function checkIfActive(e) {
      if(e.pageY > window.innerHeight * 5/6) setActiveTrue();
      if(e.pageY <= window.innerHeight * 5/6) setActiveFalse();
    }
    document.addEventListener('mousemove', checkIfActive);
    return () => document.removeEventListener('mousemove', checkIfActive);
  }, []);

  function moveRight(amount) {
    const curOffset = offsets[myId];
    const newOffset = { x: (curOffset?.x ?? 0) + amount, y: 0 };
    setOffsets(offsets => (
      {...offsets, [myId]: newOffset}
    ))
    Object.values(peersRef.current).filter(p => p.conn).forEach(peer => {
      peer.conn.send({
        type: 'offset',
        offset: newOffset
      })
    });
  }

  function moveForward(amount) {
    setOrder(order => {
      const newOrder = [...order];
      for(let i = 0; i < newOrder.length; ++i) {
        if(newOrder[i] === myId) {
          if(amount === 1 && i === 0) return order;
          if(amount === -1 && i == newOrder.length - 1) return order;
          newOrder[i] = newOrder[i-amount];
          newOrder[i-amount] = myId;
          break;
        }
      }
      Object.values(peersRef.current).filter(p => p.conn).forEach(peer => {
        peer.conn.send({
          type: 'order',
          order: newOrder
        })
      });
      return newOrder;
    })
  }

  return (
    <Container isActive={isActive}>
      <Section>
        <StyledBackgroundIcon onClick={() => setBackgroundBarActive(b => !b)}/>
      </Section>
      <Section>
        <StyledMoveIcon 
        onUp={() => moveForward(1)} 
        onDown={() => moveForward(-1)} 
        onLeft={() => moveRight(-50)} 
        onRight={() => moveRight(50)}/>
      </Section>
      <Section>
        <StyledTakePhotoIcon onClick={() => {
          const sizes = Object.values(videoSizes);
          const maxVideoHeight = Math.max(...sizes.map(s => s.height));
          const scaleFactor = globalThis?.innerHeight / maxVideoHeight;

          const canvas = document.createElement('canvas');
          canvas.width = globalThis?.innerHeight / backgroundRef.current.height * backgroundRef.current.width;
          canvas.height = maxVideoHeight * scaleFactor;
          const ctx = canvas.getContext('2d');
          
          ctx.drawImage(backgroundRef.current, 0, 0, globalThis?.innerHeight / backgroundRef.current.height * backgroundRef.current.width, globalThis?.innerHeight);

          const orderSet = new Set(order);
          const missing = Object.keys(peersRef.current).filter(id => !orderSet.has(id));
          [...order, ...missing].reverse().map(id => [id,peersRef.current[id]]).filter(([_id, peer]) => peer?.canvas?.height).forEach(([id, peer]) => {
            const height = peer.canvas.height * scaleFactor;
            const width = peer.canvas.width * scaleFactor;
            ctx.drawImage(peer.canvas, offsets[id]?.x ?? 0, globalThis?.innerHeight - height, width, height);
          });

          const dataUrl = canvas.toDataURL();
          localStorage.setItem(`groupshot-img-${new Date().getTime()}`, dataUrl);
          setPhotos(photos => [...photos, dataUrl]);
          toast.info(`Photo Saved. Click on 'Your Photos' to view or download.`);
          console.log('conns: ', Object.values(peersRef.current).filter(p => p.conn));
          Object.values(peersRef.current).filter(p => p.conn).forEach(peer => {
            peer.conn.send({
              type: 'photo',
              photo: dataUrl
            })
          });
          // var link = document.createElement('a');
          // link.download = `groupshot-${new Date().getTime()}.jpg`;
          // link.href = dataUrl;
          // link.click();
          // link.remove();
          canvas.remove();
        }}/>
      </Section>
      <Section>
        <StyledFilterIcon onClick={() => setFilterBarActive(b => !b)}/>
        <StyledYourPhotosIcon onClick={() => setPhotosBarActive(b => !b)} />
      </Section>
      <Section>
        <StyledExitIcon onClick={() => window.location = "/"} />
      </Section>
    </Container>
  )
}

const StyledExitIcon = styled(ExitIcon)`
  cursor: pointer;
  height: 60%;  
`

const StyledMoveIcon = styled(MoveIcon)`
  height: 70%;
`

const StyledBackgroundIcon = styled(BackgroundIcon)`
  cursor: pointer;
  height: 70%;
`

const StyledFilterIcon = styled(FilterIcon)`
  cursor: pointer;
  height: 70%;
`

const StyledYourPhotosIcon = styled(YourPhotosIcon)`
  cursor: pointer;
  height: 70%;
`

const StyledTakePhotoIcon = styled(TakePhotoIcon)`
  cursor: pointer;
  height: 90%;
  transform: translateY(3px);
`

const Section = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const Container = styled.div`
  position: fixed;
  z-index: 900;
  bottom: 0;
  left: 0;
  display: flex;
  width: 100vw;
  height: 100px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(40px);
  /* Note: backdrop-filter has minimal browser support */
  border-radius: 8px;
  > *:not(:last-child) {
    border-right: 2px solid #686868;
  }
  transform: translateY(${p => p.isActive ? 0 : 100}px);
  transition: transform 0.5s ease-in;
`;

export default ControlBar;
