
import { render, screen } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: mockDisconnect,
  });
  global.IntersectionObserver = mockIntersectionObserver;
});

afterEach(() => {
  jest.clearAllMocks();
});

const TestComponent = ({ options = {} }: { options?: any }) => {
  const { elementRef, hasIntersected, isIntersecting } = useIntersectionObserver(options);

  return (
    <div ref={elementRef as any} data-testid="test-element">
      <div data-testid="has-intersected">{hasIntersected.toString()}</div>
      <div data-testid="is-intersecting">{isIntersecting.toString()}</div>
    </div>
  );
};

describe('useIntersectionObserver', () => {
  it('creates an IntersectionObserver with default options', () => {
    render(<TestComponent />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '0px',
        root: null,
      }
    );
  });

  it('creates an IntersectionObserver with custom options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '100px',
    };

    render(<TestComponent options={options} />);

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '100px',
        root: null,
      }
    );
  });

  it('returns initial state correctly', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('has-intersected')).toHaveTextContent('false');
    expect(screen.getByTestId('is-intersecting')).toHaveTextContent('false');
  });

  it('calls disconnect on unmount', () => {
    const { unmount } = render(<TestComponent />);
    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
}); 