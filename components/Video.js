import { useRef, useEffect, forwardRef } from 'react';

const Video = forwardRef(({ srcObject, ...props }, ref) => {

  useEffect(() => {
    if (!ref.current) return
    ref.current.srcObject = srcObject
  }, [srcObject])

  return <video ref={ref} {...props} />
})

export default Video
