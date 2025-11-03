
import { styles } from '../../styles/common';

interface FeatureProps {
  icon: string;
  title: string;
  description: string;
}

export default function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className={styles.card.default}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={styles.heading.h3}>{title}</h3>
      <p className={styles.text.description}>{description}</p>
    </div>
  );
}

Feature.displayName = 'Feature'; 