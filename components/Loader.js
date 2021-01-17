import styled from 'styled-components'
import { useEffect, useState } from 'react';
import { firstLoadPromise } from '../utils/bodypix';
import BeatLoader from 'react-spinners/BeatLoader';

const Loader = () => {
  const [isActive, setActive] = useState(true);
  useEffect(() => {
    firstLoadPromise.finally(() => setActive(false))
  }, [])
  
  if(!isActive) return null;

  return (
    <Container>
      <BeatLoader loading size={60} color="#ffffff"/>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export default Loader;