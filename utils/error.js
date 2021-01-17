import { toast } from 'react-toastify';

export function handleError(err) {
  console.error(err);
  if(err?.response?.data?.error) {
    toast.error(err.response.data.error);
    console.error(err.response.data.error);
  } else {
    toast.error(err);
  }
}
