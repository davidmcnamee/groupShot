import { useState, useRef } from 'react';

export function useStateWithRef(initial) {
  const [state, setState] = useState(initial)
  const ref = useRef()
  ref.current = state
  return [state, setState, ref]
}
