import '@tensorflow/tfjs'
import * as bodyPix from '@tensorflow-models/body-pix';

const netPromise = bodyPix.load({
  architecture: 'MobileNetV1',
  outputStride: 16, // bigger is faster
  multiplier: 0.75, // smaller is faster
  quantBytes: 1,
});

let promiseObj = {};

export const firstLoadPromise = new Promise(resolve => {
  promiseObj.resolve = resolve;
});

export async function getSegmentation(video) {
  const net = await netPromise;
  const segmentations = await net.segmentMultiPerson(video, {
    internalResolution: 'medium', // lower is faster
    segmentationThreshold: 0.5,
    maxDetections: 3, // TODO: related to multiple people in same feed
    scoreThreshold: 0.3,
    nmsRadius: 20,
    minKeypointScore: 0.3,
    refineSteps: 1, // smaller is faster
  });
  promiseObj.resolve();
  return segmentations;
}

// TODO: make it so that multiple people can be from the same feed
export function renderToCanvas(canvas, segmentations, video, setFilterComps, filterRef) {
  if(!canvas || !video || !setFilterComps) {
    console.log('no canvas/video', canvas, video, setFilterComps);
    return;
  }
  const context = canvas.getContext('2d');
  for(let i = 0; i < segmentations.length; ++i) {
    const person = segmentations[i];
    context.drawImage(video, 0, 0, video.width, video.height);
    const imageData = context.getImageData(0, 0, video.width, video.height);
    const pixel = imageData.data;
    if(!person.data.length) person.data = new Uint8Array(person.data);
    for (let p = 0; p<pixel.length; p+=4) {
      if (person.data[p/4] == 0) {
          pixel[p+3] = 0;
      }
    }
    context.imageSmoothingEnabled = true;
    context.putImageData(imageData, 0, 0);
    if(filterRef.current) filterRef.current.storeData({canvas, segmentations, setFilterComps});
  }
}

const currentLoops = {};

export function startLoop(id, { curPeer, peerRef, peersRef, filterRef }) {
  currentLoops[id] = {curPeer, lastTime: 0, peerRef, peersRef, filterRef };
  loop(id);
  return () => stopLoop(id);
}

export function stopLoop(id) {
  currentLoops[id] = false;
}

const fps = parseInt(process.env.NEXT_PUBLIC_FPS, 10);
const fpsInterval = 1000 / fps;

function loop(id) {
  if(!currentLoops[id]) return;
  
  const next = () => loop(id);
  requestAnimationFrame(next);

  const { curPeer, lastTime, peerRef, peersRef, filterRef } = currentLoops[id];

  const elapsed = Date.now() - lastTime;
  if(elapsed < fpsInterval) return;
  currentLoops[id].lastTime = Date.now() - (elapsed % fpsInterval);

  const {conn} = curPeer;
  const { video, canvas, setFilterComps } = peerRef;
  const isSelf = !conn;
  if(!video?.width || !video?.height) return;

  getSegmentation(video).then(segmentations => {
    console.log('my segmentation: ', segmentations.length);
    console.log('got segmentations for id: ', id);
    renderToCanvas(canvas, segmentations, video, setFilterComps, filterRef);
    // send out segmentations to everyone
    if(isSelf) {
      console.log('sending segmentations to ', Object.values(peersRef.current).filter(p => p.conn).length, ' people');
      Object.values(peersRef.current).filter(p => p.conn).forEach(({ conn }) => {
        conn.send({
          type: 'segmentations',
          segmentations
        });
      });
    }
  });
}
