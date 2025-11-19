import { next } from '@vercel/edge';

// Route-specific meta tags for iOS link previews
const routeMetaTags = {
  '/': {
    title: 'PackMoveGo - Professional Moving & Packing Services | Your Trusted Moving Partner',
    description: 'PackMoveGo offers professional moving and packing services across the country. Residential, commercial, and long-distance moving solutions with expert care. Get your free quote today!',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/about': {
    title: 'About Us - PackMoveGo | Professional Moving Company Since 2020',
    description: 'Learn about PackMoveGo\'s mission, values, and commitment to providing exceptional moving services. Our professional team ensures your move is stress-free and efficient.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/services': {
    title: 'Our Services - PackMoveGo | Residential, Commercial & Long Distance Moving',
    description: 'Comprehensive moving services including residential, commercial, long-distance, packing, and storage solutions. Professional movers with expert care and competitive pricing.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/contact': {
    title: 'Contact Us - PackMoveGo | Get a Free Moving Quote Today',
    description: 'Contact PackMoveGo for professional moving services. Call (949) 414-5282 or request a free quote online. Our team is ready to help with your move.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/blog': {
    title: 'Moving & Packing Blog - PackMoveGo | Expert Tips & Guides',
    description: 'Expert moving tips, packing guides, and relocation advice from PackMoveGo professionals. Learn how to make your move stress-free with our comprehensive blog articles.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/locations': {
    title: 'Service Locations - PackMoveGo | Nationwide Moving Services',
    description: 'PackMoveGo provides professional moving and packing services nationwide. Find our service locations and areas we cover for your residential or commercial move.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/supplies': {
    title: 'Moving Supplies & Packing Materials - PackMoveGo',
    description: 'Shop professional moving supplies and packing materials from PackMoveGo. Quality boxes, bubble wrap, tape, and all the supplies you need for a successful move.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/review': {
    title: 'Customer Reviews & Testimonials - PackMoveGo | 5-Star Moving Services',
    description: 'Read real customer reviews and testimonials about PackMoveGo\'s professional moving services. See why thousands trust us with their residential and commercial moves.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/refer': {
    title: 'Refer Friends & Earn Rewards - PackMoveGo Referral Program',
    description: 'Join PackMoveGo\'s referral program and earn rewards for recommending our professional moving services to friends and family. Get discounts on future moves!',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
};

export default async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get meta tags for this route (or use homepage as fallback)
  const meta = routeMetaTags[pathname] || routeMetaTags['/'];
  
  // Fetch the HTML response
  const response = await next();
  
  // Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  // Get the HTML text
  let html = await response.text();
  
  // Replace the default OG tags with route-specific ones
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${meta.title}"`
  );
  
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${meta.description}"`
  );
  
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${meta.image}"`
  );
  
  // Replace title tag
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${meta.title}</title>`
  );
  
  // Replace Twitter card tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${meta.title}"`
  );
  
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${meta.description}"`
  );
  
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${meta.image}"`
  );
  
  // Return modified HTML
  return new Response(html, {
    headers: {
      ...response.headers,
      'content-type': 'text/html; charset=utf-8',
    },
  });
}

export const config = {
  matcher: [
    '/',
    '/about',
    '/services',
    '/contact',
    '/blog',
    '/locations',
    '/supplies',
    '/review',
    '/refer',
  ],
};

