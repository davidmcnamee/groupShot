import { toast } from 'react-toastify';


export function saveImg(base64Img) {
  try {  
    localStorage.setItem(`groupshot-img-${new Date().getTime()}`, base64Img);
    return true;
  } catch(err) {
    toast.info(`That image is too large to be saved in your browser, so we're downloading it for you.`);
    var link = document.createElement('a');
    link.download = `groupshot-${new Date().getTime()}.jpg`;
    link.href = base64Img;
    link.click();
    link.remove();
    return false;
  }
}
