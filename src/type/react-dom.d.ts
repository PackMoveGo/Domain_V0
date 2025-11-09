declare module 'react-dom/client' {
  // import * as ReactDOM from 'react-dom'; // Reserved for future use
  
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }

  export function createRoot(
    container: Element | DocumentFragment,
    options?: { hydrate?: boolean }
  ): Root;
} 