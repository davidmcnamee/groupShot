import Lottie from "react-lottie";
import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import fire from "./lottie-fire.json";

export const LottieFire = ({ x, y, zIndex }) => {
  return (
    <Container x={x} y={y} zIndex={zIndex}>
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: fire,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
        width='9em'
        style={{
          margin: 0,
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  transform: translate(calc(-50% + ${p => p.x}px), calc(-50% - 2em + ${p => p.y}px));
  z-index: ${p => p.zIndex};
`;
