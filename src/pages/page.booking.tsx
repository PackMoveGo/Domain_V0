
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Layout from '../component/layout/Layout';
import { logger } from '../util/debug';
import { getCurrentDate } from '../util/ssrUtils';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BookingFormData {
  selectedService: string;
  date: Date;
  time: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
}

const Booking = () => {

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Value>(getCurrentDate());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [bookingData] = useState<BookingFormData | null>(null);

  useEffect(() => {
    // In Next.js, we don't have location.state, so we'll redirect to services
    // You can implement state management with URL params or context if needed
    navigate('/services');
      }, [navigate]);

  // Mock function to get available times for a date
  const getAvailableTimes = () => {
    // This would typically come from your backend
    const times = [
      '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
      '04:00 PM', '05:00 PM'
    ];
    return times;
  };

  const handleDateChange = (date: Value) => {
    setSelectedDate(date);
    if (date instanceof Date) {
      setAvailableTimes(getAvailableTimes());
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleConfirmBooking = () => {
    if (bookingData) {
      logger.info('Booking confirmed:', {
        service: bookingData.selectedService,
        date: selectedDate,
        time: selectedTime,
        customerInfo: bookingData.formData
      });
    }
  };

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Book Your Service</h1>
            
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              <div className={`step ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                1. Select Date
              </div>
              <div className={`step ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                2. Choose Time
              </div>
              <div className={`step ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                3. Confirm Booking
              </div>
            </div>

            {/* Step 1: Calendar */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select a Date</h2>
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  minDate={getCurrentDate()}
                  className="w-full"
                />
                <button
                  onClick={() => setStep(2)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2: Time Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose a Time</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="p-4 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500"
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="mt-4 bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 mr-2"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Confirm Your Booking</h2>
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <p><strong>Date:</strong> {selectedDate instanceof Date ? selectedDate.toDateString() : 'N/A'}</p>
                  <p><strong>Time:</strong> {selectedTime}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Booking; 