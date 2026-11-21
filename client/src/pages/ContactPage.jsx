import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-charcoal">
          Get in Touch with Our Team
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Have inquiries about tourism safety, partnerships, or travel planning support? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-brand-emerald text-white rounded-3xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Tourism Help Desk</h2>
            <p className="text-xs text-slate-200 mt-1">
              Serving domestic and international travelers across Pakistan.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
              <span>Blue Area, Islamabad, Pakistan</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
              <span>support@myjourney.pk</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-brand-mint shrink-0 mt-0.5" />
              <span>+92 (51) 800-TOUR</span>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-700/60 text-xs text-slate-300">
            <p className="font-semibold text-brand-mint">Emergency Hotline:</p>
            <p className="mt-0.5">1422 (Pakistan Tourism Police Assistance)</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-brand-mint mx-auto" />
              <h3 className="text-xl font-bold text-brand-charcoal">Message Dispatched</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for reaching out. A representative from the myjourney.pk team will review your message shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-brand-emerald underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald/20 focus:border-brand-emerald"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4 text-brand-mint" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
