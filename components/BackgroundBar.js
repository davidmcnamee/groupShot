import styled from 'styled-components';
import { defaultBackgrounds } from '../utils/background';
import CloseIcon from './Icons/Close';

const BackgroundBar = ({ peers, peersRef, setBackground, isActive, setActive }) => {
  
  const onClick = (url) => {
    setBackground(url);
    Object.values(peersRef.current).forEach(peer => {
      if(peer.conn) {
        peer.conn.send({ type: 'background', url });
      }
    });
  }

  return (
    <Container isActive={isActive}>
      <H2>Backgrounds</H2>
      <StyledCloseIcon onClick={() => setActive(false)}/>
      <Grid>
        {defaultBackgrounds.map(url => {
          const name = /\/([^/]*?)\.(png|jpg)$/.exec(url)[1];
          return (
            <div key={url} onClick={() => onClick(url)}>
              <Preview src={url} alt={name}/>
              <span>{name}</span>
            </div>
          )
        })}
      </Grid>
    </Container>
  );
}

const StyledCloseIcon = styled(CloseIcon)`
  cursor: pointer;
  position: absolute;
  top: 1em;
  right: 1em;
  height: 2em;
  width: 2em;
`

const H2 = styled.h2`
  color: white;
  margin-bottom: 1em;
`;

const Container = styled.div`
  position: fixed;
  z-index: 901;
  right: ${p => p.isActive ? 0 : -500}px;
  top: 0;
  min-height: 100vh;
  background-color: black;
  width: 500px; // needs to be smaller for mobile
  padding: 1.5em;
  transition: right 0.5s ease-in;
  overflow: scroll;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 1em;
  grid-row-gap: 1em;
  color: white;
  > * {
    cursor: pointer;
  }
`

const Preview = styled.img`
  width: 210px;
`

export default BackgroundBar;

