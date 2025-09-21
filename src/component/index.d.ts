declare module '*/component/ServicesList' {
  import { FC } from 'react';
  interface Service {
    id: string;
    icon: string;
    title: string;
    description: string;
    duration: string;
    price: string | null;
    link: string;
  }
  interface ServicesListProps {
    services: Service[];
    onServiceSelect: (service: Service) => void;
  }
  const ServicesList: FC<ServicesListProps>;
  export default ServicesList;
}

declare module '*/component/QuoteFormSection' {
  import { FC } from 'react';
  interface FormData {
    name: string;
    email: string;
    phone: string;
    message: string;
  }
  interface QuoteFormSectionProps {
    formData: FormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onQuoteSubmit: (data: FormData) => void;
  }
  const QuoteFormSection: FC<QuoteFormSectionProps>;
  export default QuoteFormSection;
} 