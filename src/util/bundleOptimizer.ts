// Temporarily disabled for Next.js build
export class BundleOptimizer {
  private preloadedChunks = new Set<string>();

  preloadChunk(_chunkName: string): void { // Reserved for future use
    // Temporarily disabled
  }

  private getExistingChunks(): string[] {
    return [];
  }
}

export const bundleOptimizer = new BundleOptimizer();