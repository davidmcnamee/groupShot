import styled from 'styled-components'
import JoinRoom from '../components/JoinRoom'
import CreateRoom from '../components/CreateRoom'
import LogoIcon from '../components/Icons/Logo';

export default function Home() {
  

  return (
    <Container>
      <StyledLogoIcon />
      <JoinRoom />
      <Text>OR</Text>
      <CreateRoom />
    </Container>
  )
}

const StyledLogoIcon = styled(LogoIcon)`

`

const Text = styled.p`
font-family: Now;
font-style: normal;
font-weight: 500;
font-size: 30px;
line-height: 36px;
/* identical to box height */

text-align: center;

color: #000000;

`

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > * {
    margin: 0.6em 0;
  }
`;
