import styled from 'styled-components';
import { filters } from '../utils/filter';
import CloseIcon from './Icons/Close';
import { toast } from 'react-toastify';

const FilterBar = ({ peers, peersRef, setFilter, isActive, setActive }) => {
  
  const onClick = (filter) => {
    setFilter(filter);
    Object.values(peersRef.current).filter(p => p.conn).forEach(p => {
      p.conn.send({type: 'filter', filter: filter.id});
    });
  }

  return (
    <Container isActive={isActive}>
      <H2>Filters</H2>
      <StyledCloseIcon onClick={() => setActive(false)}/>
      <Grid>
        {Object.entries(filters).map(([id, filter]) => {
          return (
            <div key={id} onClick={() => onClick(filter)}>
              <Preview src={filter.img} alt={filter.name}/>
              <span>{filter.name}</span>
            </div>
          )
        })}
        <div onClick={() => {
          setFilter(null);
          Object.values(peersRef.current).filter(p => p.conn).forEach(p => {
            p.conn.send(null);
          });
        }}>
          <Preview src='/images/filters/Clear.svg'/>
          <span>Clear</span>
        </div>
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

export default FilterBar;

