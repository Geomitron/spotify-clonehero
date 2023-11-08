'use client';

import {ReactNode} from 'react';
import {IconContext} from 'react-icons';

export default function ContextProviders({children}: {children: ReactNode}) {
  return (
    <IconContext.Provider
      value={{className: 'inline-block', style: {verticalAlign: 'middle'}}}>
      {children}
    </IconContext.Provider>
  );
}