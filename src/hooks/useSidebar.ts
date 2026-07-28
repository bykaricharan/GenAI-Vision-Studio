import { useState } from 'react';

export function useSidebar(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState);

  const toggle = () => setIsExpanded((prev) => !prev);

  return {
    isExpanded,
    setIsExpanded,
    toggle,
  };
}
