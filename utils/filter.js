import styled from 'styled-components';
import flatten from 'lodash/flatten';
import { LottieFire } from '../components/Lottie/LottieFire';
import { LottieHeart } from '../components/Lottie/LottieHeart';

export const filters = {
  'heart-eyes': {
    id: 'heart-eyes',
    img: '/images/filters/HeartFilter.png',
    name: 'Heart Eyes',
    storeData: ({canvas, segmentations, setFilterComps}) => {
      setFilterComps(flatten(segmentations.map(data => {
        const keypoints = data?.pose?.keypoints;
        if(!keypoints) return [];
        return keypoints.filter(p => p.part === 'leftEye' || p.part === 'rightEye');
      })));
    },
    render: ({filterComps, scaleFactor, zIndex, offset}) => {
      return filterComps.map((point, idx) => {
        return (
          <LottieHeart key={idx} x={(offset?.x ?? 0) + point.position.x * scaleFactor} y={point.position.y * scaleFactor} zIndex={zIndex}/>
        );
      })
    }
  },
  'gold-star-filter': {
    id: 'gold-star-filter',
    img: '/images/filters/GoldStarFilter.png',
    name: 'Gold Star Filter',
    storeData: () => null,
    render: ({ backgroundRef }) => {
      return <FullBackgroundImg src='/images/filters/GoldStarFilter.png' bgWidth={backgroundRef.current.width}/>
    }
  },
  'fairy-star-filter': {
    id: 'fairy-star-filter',
    img: '/images/filters/FairyStarFilter.png',
    name: 'Fairy Star Filter',
    storeData: () => null,
    render: ({ backgroundRef }) => {
      return <FullBackgroundImg src='/images/filters/FairyStarFilter.png' bgWidth={backgroundRef.current.width}/>
    }
  },
  'fox-in-the-snow': {
    id: 'fox-in-the-snow',
    img: '/images/filters/FoxInTheSnow.png',
    name: 'Fox In The Snow',
    storeData: () => null,
    render: ({ backgroundRef }) => {
      return <FullBackgroundImg src='/images/filters/FoxInTheSnow.png' bgWidth={backgroundRef.current.width}/>
    }
  },
  'fire-eyes': {
    id: 'fire-eyes',
    img: '/images/filters/FireEyesFilter.png',
    name: 'Fire Eyes',
    storeData: ({canvas, segmentations, setFilterComps}) => {
      setFilterComps(flatten(segmentations.map(data => {
        const keypoints = data?.pose?.keypoints;
        if(!keypoints) return [];
        return keypoints.filter(p => p.part === 'leftEye' || p.part === 'rightEye');
      })));
    },
    render: ({filterComps, scaleFactor, zIndex, offset}) => {
      return filterComps.map((point, idx) => {
        return (
          <LottieFire key={idx} x={(offset?.x ?? 0) + point.position.x * scaleFactor} y={point.position.y * scaleFactor} zIndex={zIndex}/>
        );
      })
    },
  },
};


const FullBackgroundImg = styled.img`
  width: ${p => p.bgWidth}px;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 2;
`;