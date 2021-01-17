import styled from 'styled-components'
import axios from 'axios';
import { useRouter } from 'next/router';
import { handleError } from '../utils/error';
import { toast } from 'react-toastify';
import PlusIcon from './Icons/Plus';

const CreateRoom = () => {
  const router = useRouter();
  const onClick = async () => {
    toast.info('creating...');
    try {
      const { data: roomId } = await axios.post(`/create`);
      window.location = `/r/${roomId}`
    } catch(err) { handleError(err); }
  }
  
  return (
    <Button onClick={onClick}>
      <PlusIcon />&nbsp; New Room
    </Button>
  )
}

const Button = styled.button`
  cursor: pointer;
  background: linear-gradient(180deg, #49D825 0%, rgba(162, 255, 139, 0.79) 100%);
  /* Shadow Blue · 16dp */

  box-shadow: 0px 16px 24px rgba(54, 123, 245, 0.16), 0px 6px 12px rgba(54, 123, 245, 0.16);
  border-radius: 99px;
  font-family: Now;
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  /* or 140% */

  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 0.15px;

  color: #000000;
`

export default CreateRoom;
