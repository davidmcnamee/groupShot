import { renderToCanvas } from './bodypix';
import axios from 'axios';
import { toast } from 'react-toastify';
import { filters } from './filter';

function handleCallStream({ call, setPeers, setOrder }) {
  call.on('stream', stream => {
    console.log('received stream!', call.peer);
    setPeers(peers => ( // stream changes require a rerender
      {...peers, [call.peer]: { ...(peers[call.peer] ?? {}), stream } }
    ));
  });
}

// TODO: i don't know why 'close' never gets called... needs investigation
function handleCallDisconnect({ call, setPeers, setOrder }) {
  call.on('error', err => {
    console.error('CALL ERROR', err);
  })
  call.on('close', () => {
    console.log('CALL CLOSED', call.peer);
    setPeers(peers => {
      const newPeers = {...peers};
      delete newPeers[call.peer];
      return newPeers;
    });
    setOrder(order => order.filter(o => o !== call.peer));
  });
  call.on('disconnect', () => {
    console.log('CALL DISCONNECTED', call.peer);
    setPeers(peers => {
      const newPeers = {...peers};
      delete newPeers[call.peer];
      return newPeers;
    });
    setOrder(order => order.filter(o => o !== call.peer));
  });
}

function handleConnData({ conn, peers, peersRef, setBackground, setOrder, setFilter, setPhotos, setOffsets, filterRef }) {
  conn.on('data', data => {
    // console.log('RECEIVED DATA: ', JSON.stringify(data));
    // when that data is a segmentation
    if(data.type === "segmentations") {
      renderToCanvas(peersRef.current[conn.peer].canvas, data.segmentations, peersRef.current[conn.peer].video, peersRef.current[conn.peer].setFilterComps, filterRef);
    }
    if(data.type === 'background') {
      setBackground(data.url);
    }
    if(data.type === 'order') {
      setOrder(data.order); // should this be handled by realtime db?
    }
    if(data.type === 'filter') {
      setFilter(data.filter ? filters[data.filter] : null);
    }
    if(data.type === 'photo') {
      setPhotos(photos => [...photos, data.photo])
      localStorage.setItem(`groupshot-img-${new Date().getTime()}`, data.photo);
      toast.info(`Someone in your group took a photo!`)
      // var link = document.createElement('a');
      // link.download = `groupshot-${new Date().getTime()}.jpg`;
      // link.href = data.photo;
      // link.click();
      // link.remove();
    }
    if(data.type === 'offset') {
      setOffsets(offsets => (
        {...offsets, [conn.peer]: data.offset}
      ));
    }
  });
}

export async function onInit(peer, peers, peersRef, setPeers, stream, roomId, order, setOrder, setBackground, setFilter, setPhotos, setOffsets, filterRef) {
  // when someone starts a stream connection
  peer.on('call', call => {
    console.log('receiving call from ', call.peer);
    call.answer(stream);
    // when that person sends a stream
    handleCallStream({ call, setPeers, setOrder });

    // when that person disconnects
    handleCallDisconnect({ call, setPeers, setOrder });
  });
  
  // when someone starts a data connection
  peer.on('connection', conn => {
    conn.on('open', () => {
      console.log('before setting con: ', peers[conn.peer]);
      if(!peersRef.current[conn.peer]) peersRef.current[conn.peer] = {};
      peersRef.current[conn.peer].conn = conn;
      console.log('SETTING CONN', conn.peer, peers[conn.peer]);
      setOrder(order => {
        const newOrder = [...order, conn.peer];
        conn.send({ type: 'order', order: newOrder });
        return newOrder;
      });
      // when data is received
      handleConnData({ conn, peers, setBackground, setOrder, setFilter, setPhotos, setOffsets, peersRef, filterRef });
    })
  });

  const { data: members } = await axios.post('/join', { clientId: peer.id, roomId });
  console.log({members});
  members.forEach(m => {
    const call = peer.call(m, stream);
    handleCallStream({ call, setPeers, setOrder });
    handleCallDisconnect({ call, setPeers, setOrder });
    const conn = peer.connect(m);
    conn.on('open', () => {
      console.log('before setting con: ', peers[conn.peer]);
      if(!peersRef.current[conn.peer]) peersRef.current[conn.peer] = {};
      peersRef.current[conn.peer].conn = conn;
      console.log('SETTING CONN', conn.peer, peers[conn.peer]);
      handleConnData({ conn, peers, setBackground,  setOrder, setFilter, setPhotos, setOffsets, peersRef,filterRef });
    });
  });
}
