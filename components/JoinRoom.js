import styled from 'styled-components'
import axios from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { handleError } from '../utils/error';
import { toast } from 'react-toastify';

const JoinRoom = () => {
  const router = useRouter();
  const { handleSubmit, register, errors } = useForm();  
  const onSubmit = async (values) => {
    toast.info('joining...');
    try {
      const { data } = await axios.post(`/check`, { roomId: values.roomCode });
      if(!data.success) toast.error('No room found with that code 😔');
      else window.location = `/r/${values.roomCode}`;
    } catch(err) { handleError(err); }
  }

  useEffect(() => {
    if(errors?.roomCode?.message) {
      toast.error(errors?.roomCode?.message);
    }
  }, [errors]);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input name="roomCode" ref={register({
        required: "Required",
        pattern: {
          value: /^[0-9a-f]{24}$/i,
          message: 'invalid room code'
        }
      })}/>
      <Button type="submit">Join</Button>
    </form>
  )
}

const Input = styled.input.attrs({
  placeholder: 'Enter room ID'
})`
background: #E2E2E2;
border: 2px solid #000000;
box-sizing: border-box;
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
font-family: Now;
font-style: normal;
font-weight: normal;
font-size: 30px;
line-height: 37px;
/* identical to box height */


color: #686868;
padding: 0.5em;
`

const Button = styled.button`
background: linear-gradient(180deg, rgba(244, 121, 53, 0.79) 0%, rgba(253, 200, 48, 0.65) 100%);
/* Shadow Blue · 16dp */

box-shadow: 0px 16px 24px rgba(54, 123, 245, 0.16), 0px 6px 12px rgba(54, 123, 245, 0.16);
border-radius: 99px;
font-family: Now;
font-style: normal;
font-weight: 500;
font-size: 20px;
line-height: 28px;
/* or 140% */

margin-left: 1em;
display: inline-flex;
align-items: center;
text-align: center;
letter-spacing: 0.15px;

color: #000000;
cursor: pointer;
`

export default JoinRoom;
