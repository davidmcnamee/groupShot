import styled from 'styled-components';
import CloseIcon from './Icons/Close';

const PhotosBar = ({ photos, peersRef, isActive, setActive }) => {
  
  const onClick = (photo) => {
    var link = document.createElement('a');
    link.download = `group-shot-${new Date().getTime()}.jpg`;
    link.href = photo;
    link.click();
    link.remove();
  }

  return (
    <Container isActive={isActive}>
      <H2>Photos</H2>
      <StyledCloseIcon onClick={() => setActive(false)}/>
      <Grid>
        {photos.map(photo => {
          return (
            <div key={photo} onClick={() => onClick(photo)}>
              <Preview src={photo} alt="Photo Preview"/>
              <span>{' '}</span>
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
  width: 250px;
`

export default PhotosBar;


