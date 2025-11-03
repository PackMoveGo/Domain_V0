
import { styles } from '../../../styles/common';

export default function FinalCTA() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
      <div className={styles.container}>
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-6xl mb-6">🚚</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Move?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have trusted Pack Move Go with their moving needs. 
            Get your free quote today and experience the difference of professional moving services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="text-white font-semibold mb-2">Quick & Easy</h3>
              <p className="text-blue-100 text-sm">Get your quote in minutes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-white font-semibold mb-2">Best Price</h3>
              <p className="text-blue-100 text-sm">Competitive rates guaranteed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🛡️</div>
              <h3 className="text-white font-semibold mb-2">Fully Protected</h3>
              <p className="text-blue-100 text-sm">Licensed, bonded & insured</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <button className={`${styles.button.cta} bg-white text-blue-600 hover:bg-gray-100 max-w-xs`}>
              <span className="text-blue-600">Get Free Quote Now</span>
            </button>
            <button className={`${styles.button.secondary} border-white text-white hover:bg-white hover:text-blue-600`}>
              Call (800) PACK-MOVE
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-blue-100 text-sm">
              No obligation • Free estimates • 24/7 support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

FinalCTA.displayName = 'FinalCTA'; 