
import { styles } from '../../../styles/common';

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: 'Get Your Quote',
    description: 'Enter your move details and get an instant quote in minutes',
    icon: '📋'
  },
  {
    number: 2,
    title: 'Schedule Your Move',
    description: 'Choose your preferred date and time for your move',
    icon: '📅'
  },
  {
    number: 3,
    title: 'We Pack & Move',
    description: 'Our professional team handles everything with care',
    icon: '📦'
  },
  {
    number: 4,
    title: 'Enjoy Your New Home',
    description: 'Settle into your new space while we handle the details',
    icon: '🏠'
  }
];

export default function ProcessSteps() {
  return (
    <div className={`${styles.section.default} bg-white`}>
      <div className={styles.container}>
        <div className="text-center mb-16">
          <h2 className={styles.heading.h2}>How It Works</h2>
          <p className={`${styles.text.body} max-w-3xl mx-auto`}>
            Moving doesn't have to be stressful. Our simple 4-step process makes your move smooth and worry-free.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step) => (
            <div key={step.number} className="relative">
              {/* Connection line for desktop */}
              {step.number < processSteps.length && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-blue-200 z-0" 
                     style={{ width: 'calc(100% - 2rem)' }}></div>
              )}
              
              <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4 mx-auto">
                  {step.number}
                </div>
                <div className="text-4xl mb-4 text-center">{step.icon}</div>
                <h3 className={`${styles.heading.h3} text-center mb-3`}>
                  {step.title}
                </h3>
                <p className={`${styles.text.description} text-center`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className={`${styles.button.cta} max-w-xs`}>
            Start Your Move Today
          </button>
        </div>
      </div>
    </div>
  );
}

ProcessSteps.displayName = 'ProcessSteps'; 