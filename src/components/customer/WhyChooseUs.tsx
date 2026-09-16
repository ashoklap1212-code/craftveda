import React from 'react';
import { 
  ShieldCheck, PackageCheck, Truck, RefreshCw, Sparkles, CheckCircle2, Lock 
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-terracotta-500" />,
      title: 'Authentic Traditional Products',
      description: '100% genuine handcrafted ceramic, clay, and terracotta made using age-old Indian pottery techniques.',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-terracotta-500" />,
      title: 'Quality Checked & Food Safe',
      description: 'Every pot, handi, and jadi undergoes strict firing inspection, lead-free glaze verification, and leak testing.',
    },
    {
      icon: <Lock className="w-6 h-6 text-terracotta-500" />,
      title: 'Instant UPI & Secure Payments',
      description: 'Pay safely using GPay, PhonePe, Paytm, BHIM UPI, or Credit/Debit Cards with instant confirmation.',
    },
    {
      icon: <PackageCheck className="w-6 h-6 text-terracotta-500" />,
      title: 'Breakage-Free Transit Guarantee',
      description: 'Specially engineered triple-layered eco cushioning ensures delicate earthenware arrives in perfect condition.',
    },
    {
      icon: <Truck className="w-6 h-6 text-terracotta-500" />,
      title: 'Reliable All-India Express Delivery',
      description: 'Shipped via premium courier partners with live SMS updates and estimated delivery within 3-5 days.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-terracotta-500" />,
      title: 'Seamless Order Tracking & Support',
      description: 'Dynamic order status timeline tracking from packing to delivery with dedicated customer helpline.',
    },
  ];

  return (
    <section className="py-16 bg-cream-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600">
            Trust & Quality Assurance
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-earth-900 mt-1">
            Why Shop With CraftVeda?
          </h2>
          <p className="text-xs sm:text-sm text-earth-600 mt-2">
            We take extreme care in bringing fragile Indian handicrafts from rural potter wheels straight to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl border border-earth-200/80 shadow-sm hover:shadow-warm transition-all duration-300 flex items-start gap-4"
            >
              <div className="p-3 bg-terracotta-50 rounded-xl shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-earth-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-earth-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
