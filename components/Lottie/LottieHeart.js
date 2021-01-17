import Lottie from "react-lottie";
import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import heart from "./lottie-heart.json";

export const LottieHeart = ({ x, y, zIndex }) => {
  return (
    <Container x={x} y={y} zIndex={zIndex}>
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: heart,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
        width='6em'
        style={{
          margin: 0,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  transform: translate(calc(-50% + ${p => p.x}px), calc(-50% + 0.5em + ${p => p.y}px));
  z-index: ${p => p.zIndex};
`;
