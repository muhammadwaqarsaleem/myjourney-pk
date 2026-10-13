export default function App() {
  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-200">
        <h1 className="text-3xl font-extrabold text-brand-emerald mb-2">
          myjourney.pk
        </h1>
        <p className="text-slate-600 mb-4">
          Discover the beauty, heritage, and flavors of Pakistan.
        </p>
        <button className="bg-brand-emerald hover:bg-brand-mint text-white font-semibold px-5 py-2.5 rounded-xl transition duration-200">
          Tailwind is Active
        </button>
      </div>
    </div>
  );
}