import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../hooks/useAuth';

const FAQS = [
  {
    q: 'How quickly will I receive booking confirmation?',
    a: 'Hotel reservations are verified directly with regional hosts and confirmed within 4 to 12 hours.',
  },
  {
    q: 'What is the Pakistan Tourism Police helpline?',
    a: 'Dial 1422 from any local SIM for 24/7 dedicated tourist security and high-altitude emergency assistance.',
  },
  {
    q: 'Can I request customized trekking guides?',
    a: 'Yes! Leave an inquiry detailing your route and dates, and our regional expedition coordinators will connect with you.',
  },
];

export default function ContactPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  }));

  const [validationError, setValidationError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Submit contact message mutation
  const contactMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/contact', payload);
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      setValidationError('');
    },
    onError: (err) => {
      setValidationError(
        err.response?.data?.message || err.message || 'Failed to dispatch inquiry. Please try again.'
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name) {
      setValidationError('Please provide your name.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please provide a valid email address.');
      return;
    }

    if (!subject) {
      setValidationError('Please specify the subject of your inquiry.');
      return;
    }

    if (!message) {
      setValidationError('Please write your message or question.');
      return;
    }

    contactMutation.mutate({ name, email, subject, message });
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brand-emerald/10 via-brand-sand/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-bold tracking-wide uppercase mb-3">
            <Mail className="w-3.5 h-3.5 text-brand-mint" />
            <span>Support & Tourism Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-charcoal tracking-tight">
            Get in Touch with Our Team
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            Have questions about high-altitude road conditions, hotel reservations, or creator partnerships?
            Our regional travel specialists are ready to assist.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Channels & FAQs (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Help Desk Card */}
            <div className="bg-gradient-to-br from-brand-emerald to-slate-900 text-white rounded-3xl p-8 shadow-md">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-mint" />
                <span>Tourism Headquarters</span>
              </h2>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Coordinating travel resources, verified stays, and expedition advice across all provinces of Pakistan.
              </p>

              <div className="mt-6 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Central Operations Office</p>
                    <p className="text-slate-300">Blue Area, Jinnah Avenue, Islamabad, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Direct Email</p>
                    <a
                      href="mailto:support@myjourney.pk"
                      className="text-slate-300 hover:text-white underline transition"
                    >
                      support@myjourney.pk
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Tourist Inquiries & Lodging</p>
                    <p className="text-slate-300">+92 (51) 800-TOUR (8687)</p>
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Alert */}
              <div className="mt-6 pt-5 border-t border-emerald-800/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-mint shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-brand-mint uppercase tracking-wider text-[11px]">
                    Emergency Tourism Police Hotline
                  </p>
                  <p className="text-slate-200 mt-0.5 font-bold text-sm">
                    Dial 1422 <span className="font-normal text-xs text-slate-300">(Toll-free nationwide)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-brand-charcoal uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-emerald" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3 pt-2">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="font-bold text-xs text-brand-charcoal">{faq.q}</p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form / Confirmation (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand-sand text-brand-emerald flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-9 h-9 text-brand-emerald" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-charcoal">Message Dispatched!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. A representative from the <span className="font-bold text-brand-emerald">myjourney.pk</span> team will review your inquiry and get back to you via email shortly.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs min-h-[44px]"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-brand-charcoal">
                      Send Us an Inquiry
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Fill out the form below and we will respond within 24 hours.
                    </p>
                  </div>

                  {/* Validation or API Error Banner */}
                  {validationError && (
                    <div
                      className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Ayesha Tariq"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-brand-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ayesha@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-brand-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Inquiry regarding Skardu high-pass accessibility in November"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-brand-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Message Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your trip plans, dates, or specific lodging questions in detail..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-brand-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full py-3.5 px-6 rounded-2xl bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs min-h-[44px]"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-brand-mint" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
