
import { styles } from '../../../styles/common';

export default function EmergencyContact() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 py-16">
      <div className={styles.container}>
        <div className="text-center">
          <div className="text-6xl mb-6">🚨</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need to Move Urgently?
          </h2>
          <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
            We understand that sometimes moves need to happen quickly. Our emergency moving service is available 24/7 for urgent relocations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Same Day Service</h3>
              <p className="text-red-100">Available for urgent moves when possible</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-semibold text-white mb-2">24/7 Hotline</h3>
              <p className="text-red-100">Call us anytime for emergency moves</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Fully Insured</h3>
              <p className="text-red-100">Your belongings are protected</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a 
              href="tel:+19494145282"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center"
            >
              📞 Call Now: (949) 414-5282
            </a>
            <button className={`${styles.button.secondary} border-white text-white hover:bg-white hover:text-red-600`}>
              Emergency Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

EmergencyContact.displayName = 'EmergencyContact'; 