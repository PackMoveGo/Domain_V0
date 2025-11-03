import { FC } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../component/business/SEO';

const Sitemap: FC = () => {
  const sitemapData = [
    {
      title: 'Main Pages',
      links: [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Services', path: '/services' },
        { name: 'Contact', path: '/contact' },
      ]
    },
    {
      title: 'Moving Services',
      links: [
        { name: 'Book a Move', path: '/booking' },
        { name: 'Moving Supplies', path: '/supplies' },
        { name: 'Service Locations', path: '/locations' },
        { name: 'Moving Tips', path: '/tips' },
      ]
    },
    {
      title: 'Customer Resources',
      links: [
        { name: 'FAQ', path: '/faq' },
        { name: 'Blog', path: '/blog' },
        { name: 'Reviews', path: '/review' },
        { name: 'Refer a Friend', path: '/refer' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
      ]
    },
  ];

  return (
    <>
      <SEO 
        title="Sitemap - Pack Move Go | Find All Our Pages"
        description="Browse all pages on Pack Move Go's website. Find information about our moving services, resources, and company information easily."
        keywords="sitemap, pack move go pages, moving services directory, website navigation"
        url="https://packmovego.com/sitemap"
      />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">Sitemap</h1>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {sitemapData.map((section, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-600">{section.title}</h2>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        to={link.path}
                        className="text-gray-600 hover:text-blue-600 transition duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sitemap; 