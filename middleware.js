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
  '/terms': {
    title: 'Terms of Service - PackMoveGo | Moving Services Terms & Conditions',
    description: 'Read PackMoveGo\'s terms of service and conditions for using our professional moving and packing services. Understand your rights and responsibilities.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/privacy': {
    title: 'Privacy Policy - PackMoveGo | Your Data Protection & Privacy',
    description: 'PackMoveGo\'s privacy policy explains how we collect, use, and protect your personal information. Learn about our commitment to your privacy.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/faq': {
    title: 'FAQ - PackMoveGo | Frequently Asked Questions About Moving',
    description: 'Get answers to common questions about PackMoveGo\'s moving services, pricing, scheduling, and more. Find the information you need.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
  '/booking': {
    title: 'Book Your Move - PackMoveGo | Schedule Professional Moving Services',
    description: 'Book your move with PackMoveGo online. Choose your moving date, get an instant quote, and schedule professional movers for your relocation.',
    image: 'https://packmovego.com/og-cover-v2.jpg',
  },
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;
  
  // Handle dynamic routes with pattern matching
  let meta;
  
  // Check for exact match first
  if (routeMetaTags[pathname]) {
    meta = routeMetaTags[pathname];
  }
  // Handle /services/:id routes
  else if (pathname.startsWith('/services/') && pathname !== '/services') {
    const serviceName = pathname.split('/services/')[1];
    const formattedName = serviceName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    meta = {
      title: `${formattedName} - PackMoveGo | Professional Moving Service`,
      description: `Get professional ${formattedName.toLowerCase()} services from PackMoveGo. Expert movers, competitive pricing, and exceptional customer service.`,
      image: 'https://packmovego.com/og-cover-v2.jpg',
    };
  }
  // Handle /supplies/:id routes
  else if (pathname.startsWith('/supplies/') && pathname !== '/supplies') {
    const supplyName = pathname.split('/supplies/')[1];
    const formattedName = supplyName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    meta = {
      title: `${formattedName} - PackMoveGo Moving Supplies`,
      description: `Shop ${formattedName.toLowerCase()} from PackMoveGo. Quality moving and packing supplies for your relocation needs.`,
      image: 'https://packmovego.com/og-cover-v2.jpg',
    };
  }
  // Handle /blog/:id routes
  else if (pathname.startsWith('/blog/') && pathname !== '/blog') {
    const postSlug = pathname.split('/blog/')[1];
    const formattedTitle = postSlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    meta = {
      title: `${formattedTitle} - PackMoveGo Blog`,
      description: `Read our blog post about ${formattedTitle.toLowerCase()}. Expert moving tips and advice from PackMoveGo professionals.`,
      image: 'https://packmovego.com/og-cover-v2.jpg',
    };
  }
  // Fallback to homepage
  else {
    meta = routeMetaTags['/'];
  }
  
  // Fetch the original response
  const response = await fetch(request);
  
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
    '/services/:path*',
    '/contact',
    '/blog',
    '/blog/:path*',
    '/locations',
    '/supplies',
    '/supplies/:path*',
    '/review',
    '/refer',
    '/terms',
    '/privacy',
    '/faq',
    '/booking',
  ],
};

