
import { styles } from '../../styles/common';

interface TestimonialProps {
  quote: string;
  author?: string;
  role?: string;
  rating?: number;
}

export default function Testimonial({ quote, author, role, rating }: TestimonialProps) {
  return (
    <div className={styles.card.default}>
      <blockquote className={styles.text.body}>
        {quote}
        {(author || role) && (
          <footer className="mt-4">
            {author && <cite className={styles.heading.h3}>{author}</cite>}
            {role && <span className={styles.text.description}>{role}</span>}
            {rating && (
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    {i < rating ? "★" : "☆"}
                  </span>
                ))}
              </div>
            )}
          </footer>
        )}
      </blockquote>
    </div>
  );
}

Testimonial.displayName = 'Testimonial'; 