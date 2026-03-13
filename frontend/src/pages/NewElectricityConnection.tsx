import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import KioskLayout from '@/components/KioskLayout';
import DocumentSelector from '@/components/DocumentSelector';
import { Zap, CheckCircle2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
type Step = 'connection_type' | 'applicant' | 'address' | 'documents' | 'review' | 'success';

const STEPS: Step[] = ['connection_type', 'applicant', 'address', 'documents', 'review', 'success'];

const STEP_LABELS = {
  en: ['Connection Type', 'Applicant', 'Address', 'Documents', 'Review', 'Submitted'],
  hi: ['कनेक्शन प्रकार', 'आवेदक', 'पता', 'दस्तावेज़', 'समीक्षा', 'जमा'],
};

interface ConnectionData {
  category: 'domestic' | 'commercial' | '';
  ownership: 'owner' | 'tenant' | '';
  loadCategory: string;
  loadLabel: string;
  loadLabelHi: string;
  name: string;
  fatherSpouseName: string;
  phone: string;
  email: string;
  useRegisteredAddress: boolean;
  address: {
    house: string;
    street: string;
    city: string;
    pin: string;
  };
}

interface SelectedDocument {
  requirementId: string;
  documentId?: string;
  isNew: boolean;
  file?: File;
  preCheckStatus?: 'checking' | 'valid' | 'invalid' | 'blur' | 'format_error';
  preCheckMessage?: string;
}

// ─── Load category options ──────────────────────────────
const LOAD_OPTIONS = [
  { id: 'small', en: 'Small Home', hi: 'छोटा घर', range: '1–3 kW', icon: '🏠' },
  { id: 'medium', en: 'Medium Home', hi: 'मध्यम घर', range: '3–5 kW', icon: '🏡' },
  { id: 'large', en: 'Large Home', hi: 'बड़ा घर', range: '5–10 kW', icon: '🏘️' },
  { id: 'commercial', en: 'Shop / Business', hi: 'दुकान / व्यवसाय', range: '5–15 kW', icon: '🏪' },
];

// ─── Document requirements ──────────────────────────────
const DOC_REQUIREMENTS = [
  { id: 'identity', name: 'Identity Proof (Aadhaar / Voter ID)', nameHi: 'पहचान प्रमाण (आधार / मतदाता पहचान पत्र)', type: 'identity', required: true },
  { id: 'address', name: 'Address Proof', nameHi: 'पता प्रमाण', type: 'address', required: true },
  { id: 'property', name: 'Ownership / Rent Proof', nameHi: 'स्वामित्व / किराया प्रमाण', type: 'property', required: true },
];

// ─── Main Component ─────────────────────────────────────
const NewElectricityConnection: React.FC = () => {
  const { language, citizen } = useApp();
  const navigate = useNavigate();
  const isHi = language === 'hi';

  const [step, setStep] = useState<Step>('connection_type');
  const [applicationId, setApplicationId] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const [data, setData] = useState<ConnectionData>({
    category: '',
    ownership: '',
    loadCategory: '',
    loadLabel: '',
    loadLabelHi: '',
    name: citizen?.name || '',
    fatherSpouseName: '',
    phone: citizen?.phone || '',
    email: citizen?.email || '',
    useRegisteredAddress: true,
    address: { house: '', street: '', city: citizen?.city || '', pin: '' },
  });

  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocument[]>(() =>
    DOC_REQUIREMENTS.map((req) => {
      const saved = citizen?.documents.find((d) => d.type === req.type && d.status === 'valid');
      return saved
        ? { requirementId: req.id, documentId: saved.id, isNew: false, preCheckStatus: 'valid' as const }
        : { requirementId: req.id, isNew: false };
    })
  );

  // ─── Navigation helpers ─────────────────────────────
  const currentIndex = STEPS.indexOf(step);
  const goNext = () => currentIndex < STEPS.length - 1 && setStep(STEPS[currentIndex + 1]);
  const goBack = () => {
    if (currentIndex === 0) navigate('/service/electricity');
    else setStep(STEPS[currentIndex - 1]);
  };

  // ─── Document handlers ──────────────────────────────
  const handleDocumentSelect = (requirementId: string, documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.map((sd) =>
        sd.requirementId === requirementId
          ? { ...sd, documentId, isNew: false, preCheckStatus: 'valid' as const }
          : sd
      )
    );
  };

  const handleNewDocumentUpload = (requirementId: string, file: File) => {
    setSelectedDocuments((prev) =>
      prev.map((sd) =>
        sd.requirementId === requirementId
          ? { ...sd, file, isNew: true, documentId: undefined, preCheckStatus: 'checking' as const }
          : sd
      )
    );
    setTimeout(() => {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      const isBlurry = Math.random() < 0.1;
      let status: 'valid' | 'invalid' | 'blur' | 'format_error' = 'valid';
      let message = '';
      if (!isValid) {
        status = 'format_error';
        message = isHi ? 'फ़ाइल PDF या छवि (JPG/PNG) होनी चाहिए' : 'File must be PDF or image (JPG/PNG)';
      } else if (isBlurry) {
        status = 'blur';
        message = isHi ? 'छवि धुंधली दिखाई दे रही है।' : 'Image appears blurry. Please re-upload.';
      }
      setSelectedDocuments((prev) =>
        prev.map((sd) =>
          sd.requirementId === requirementId ? { ...sd, preCheckStatus: status, preCheckMessage: message } : sd
        )
      );
    }, 2000);
  };

  // ─── Submit handler ─────────────────────────────────
  const handleSubmit = () => {
    const appId = `ELEC${Date.now().toString().slice(-10)}`;
    setApplicationId(appId);
    goNext();
  };

  // ─── Progress Bar ───────────────────────────────────
  const renderProgress = () => {
    const labels = isHi ? STEP_LABELS.hi : STEP_LABELS.en;
    return (
      <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-white shadow-md animate-slide-up">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              {isHi ? 'नया बिजली कनेक्शन' : 'New Electricity Connection'}
            </h1>
            <p className="text-white/80 text-sm">{labels[currentIndex]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-white text-slate-800 scale-110 shadow-md'
                    : i < currentIndex
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/50'
                }`}
              >
                {i < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded ${i < currentIndex ? 'bg-white/30' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // ─── Step 1: Connection Type ────────────────────────
  const renderConnectionType = () => (
    <div className="space-y-6 animate-scale-in">
      {/* Category: Domestic / Commercial */}
      <div className="kiosk-card">
        <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          {isHi ? 'कनेक्शन श्रेणी' : 'Connection Category'}
        </label>
        <div className="grid grid-cols-2 gap-4">
          {([
            { id: 'domestic', en: 'Domestic Connection', hi: 'घरेलू कनेक्शन', icon: '🏠' },
            { id: 'commercial', en: 'Commercial Connection', hi: 'वाणिज्यिक कनेक्शन', icon: '🏢' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setData((d) => ({ ...d, category: opt.id, ownership: '', loadCategory: '' }))}
              className={`min-h-[140px] rounded-2xl border-2 flex flex-col items-center justify-center gap-3 p-6 transition-all active:scale-[0.98] ${
                data.category === opt.id
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg ring-2 ring-amber-300/50'
                  : 'border-border hover:border-amber-400/50 hover:bg-muted/50'
              }`}
            >
              <span className="text-5xl">{opt.icon}</span>
              <span className="text-lg font-bold text-foreground">{isHi ? opt.hi : opt.en}</span>
              {data.category === opt.id && <CheckCircle2 className="w-6 h-6 text-amber-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Ownership: Owner / Tenant */}
      {data.category && (
        <div className="kiosk-card animate-slide-up">
          <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">🔑</span>
            {isHi ? 'स्वामित्व' : 'Ownership'}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {([
              { id: 'owner', en: 'Owner', hi: 'मालिक', icon: '🏡' },
              { id: 'tenant', en: 'Tenant', hi: 'किरायेदार', icon: '📝' },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setData((d) => ({ ...d, ownership: opt.id }))}
                className={`min-h-[100px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-5 transition-all active:scale-[0.98] ${
                  data.ownership === opt.id
                    ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                }`}
              >
                <span className="text-4xl">{opt.icon}</span>
                <span className="text-lg font-bold">{isHi ? opt.hi : opt.en}</span>
                {data.ownership === opt.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Load Category */}
      {data.ownership && (
        <div className="kiosk-card animate-slide-up">
          <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            {isHi ? 'लोड श्रेणी' : 'Load Category'}
          </label>
          <div className="grid grid-cols-2 gap-4">
            {LOAD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() =>
                  setData((d) => ({ ...d, loadCategory: opt.id, loadLabel: opt.en, loadLabelHi: opt.hi }))
                }
                className={`min-h-[120px] rounded-2xl border-2 flex flex-col items-center justify-center gap-2 p-5 transition-all active:scale-[0.98] ${
                  data.loadCategory === opt.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg ring-2 ring-amber-300/50'
                    : 'border-border hover:border-amber-400/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-4xl">{opt.icon}</span>
                <span className="text-lg font-bold">{isHi ? opt.hi : opt.en}</span>
                <span className="text-sm text-muted-foreground font-medium">{opt.range}</span>
                {data.loadCategory === opt.id && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      {data.loadCategory && (
        <div className="flex gap-4 pt-2 animate-slide-up">
          <button onClick={goBack} className="flex-1 kiosk-btn-ghost flex items-center justify-center gap-2 text-lg">
            <span className="text-2xl">←</span> {isHi ? 'वापस' : 'Back'}
          </button>
          <button onClick={goNext} className="flex-1 kiosk-btn-primary flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all">
            {isHi ? 'आगे बढ़ें' : 'Continue'} <span className="text-2xl">→</span>
          </button>
        </div>
      )}
    </div>
  );

  // ─── Step 2: Applicant Details ──────────────────────
  const renderApplicant = () => (
    <div className="space-y-6 animate-scale-in">
      {/* Auto-fill banner */}
      <div className="kiosk-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {isHi ? 'आवेदक विवरण' : 'Applicant Details'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isHi ? '✅ प्रोफ़ाइल से स्वत: भरा गया — कृपया पुष्टि करें या संपादित करें' : '✅ Auto-filled from your SUVIDHA profile — confirm or edit'}
            </p>
          </div>
        </div>
      </div>

      <div className="kiosk-card space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {isHi ? 'पूरा नाम' : 'Full Name'}
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
            className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Father / Spouse Name */}
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {isHi ? 'पिता / पति का नाम' : 'Father / Spouse Name'}
          </label>
          <input
            type="text"
            value={data.fatherSpouseName}
            onChange={(e) => setData((d) => ({ ...d, fatherSpouseName: e.target.value }))}
            placeholder={isHi ? 'पिता या पति/पत्नी का नाम' : 'Enter father or spouse name'}
            className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
          </label>
          <div className="relative">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
              className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-success bg-success/10 px-3 py-1 rounded-full">
              ✓ {isHi ? 'सत्यापित' : 'Verified'}
            </span>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {isHi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
            placeholder={isHi ? 'ईमेल पता' : 'email@example.com'}
            className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 pt-2">
        <button onClick={goBack} className="flex-1 kiosk-btn-ghost flex items-center justify-center gap-2 text-lg">
          <span className="text-2xl">←</span> {isHi ? 'वापस' : 'Back'}
        </button>
        <button
          onClick={goNext}
          disabled={!data.name || !data.fatherSpouseName || !data.phone}
          className="flex-1 kiosk-btn-primary flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isHi ? 'आगे बढ़ें' : 'Continue'} <span className="text-2xl">→</span>
        </button>
      </div>
    </div>
  );

  // ─── Step 3: Installation Address ───────────────────
  const registeredAddr = citizen
    ? `${isHi ? citizen.addressHi : citizen.address}, ${isHi ? citizen.cityHi : citizen.city}, ${citizen.ward}`
    : '';

  const renderAddress = () => (
    <div className="space-y-6 animate-scale-in">
      <div className="kiosk-card">
        <label className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-xl">📍</span>
          {isHi ? 'स्थापना पता' : 'Installation Address'}
        </label>

        {/* Registered Address Card */}
        <button
          onClick={() => setData((d) => ({ ...d, useRegisteredAddress: true }))}
          className={`w-full p-5 rounded-2xl border-2 flex items-start gap-4 text-left mb-4 transition-all active:scale-[0.98] ${
            data.useRegisteredAddress
              ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-2xl">🏠</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg mb-1">
              {isHi ? 'पंजीकृत पता उपयोग करें' : 'Use Registered Address'}
            </p>
            <p className="text-muted-foreground leading-relaxed">{registeredAddr}</p>
          </div>
          {data.useRegisteredAddress && <CheckCircle2 className="w-6 h-6 text-primary mt-1 flex-shrink-0" />}
        </button>

        {/* New Address */}
        <button
          onClick={() => setData((d) => ({ ...d, useRegisteredAddress: false }))}
          className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 text-left transition-all active:scale-[0.98] ${
            !data.useRegisteredAddress
              ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📝</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground text-lg">
              {isHi ? 'नया पता जोड़ें' : 'Add New Address'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isHi ? 'अगर स्थापना का पता अलग है' : 'If installation address is different'}
            </p>
          </div>
          {!data.useRegisteredAddress && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
        </button>
      </div>

      {/* New address form */}
      {!data.useRegisteredAddress && (
        <div className="kiosk-card space-y-5 animate-slide-up">
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {isHi ? 'मकान / भवन का नाम' : 'House / Building Name'}
            </label>
            <input
              type="text"
              value={data.address.house}
              onChange={(e) => setData((d) => ({ ...d, address: { ...d.address, house: e.target.value } }))}
              className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {isHi ? 'गली / मोहल्ला' : 'Street / Locality'}
            </label>
            <input
              type="text"
              value={data.address.street}
              onChange={(e) => setData((d) => ({ ...d, address: { ...d.address, street: e.target.value } }))}
              className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {isHi ? 'शहर' : 'City'}
              </label>
              <input
                type="text"
                value={data.address.city}
                onChange={(e) => setData((d) => ({ ...d, address: { ...d.address, city: e.target.value } }))}
                className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                {isHi ? 'पिन कोड' : 'PIN Code'}
              </label>
              <input
                type="text"
                value={data.address.pin}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    address: { ...d.address, pin: e.target.value.replace(/\D/g, '').slice(0, 6) },
                  }))
                }
                inputMode="numeric"
                maxLength={6}
                className="w-full min-h-[64px] px-6 text-xl rounded-2xl bg-muted/30 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 font-mono tracking-widest transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 pt-2">
        <button onClick={goBack} className="flex-1 kiosk-btn-ghost flex items-center justify-center gap-2 text-lg">
          <span className="text-2xl">←</span> {isHi ? 'वापस' : 'Back'}
        </button>
        <button
          onClick={goNext}
          disabled={
            !data.useRegisteredAddress &&
            (!data.address.house || !data.address.street || !data.address.city || data.address.pin.length !== 6)
          }
          className="flex-1 kiosk-btn-primary flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isHi ? 'आगे बढ़ें' : 'Continue'} <span className="text-2xl">→</span>
        </button>
      </div>
    </div>
  );

  // ─── Step 4: Documents ──────────────────────────────
  const renderDocuments = () => (
    <DocumentSelector
      requirements={DOC_REQUIREMENTS}
      selectedDocuments={selectedDocuments}
      onDocumentSelect={handleDocumentSelect}
      onNewDocumentUpload={handleNewDocumentUpload}
      onConfirm={goNext}
      onBack={goBack}
    />
  );

  // ─── Step 5: Review ─────────────────────────────────
  const getDisplayAddress = () => {
    if (data.useRegisteredAddress) return registeredAddr;
    const a = data.address;
    return [a.house, a.street, a.city, a.pin].filter(Boolean).join(', ');
  };

  const renderReview = () => {
    const rows = [
      {
        label: isHi ? 'कनेक्शन श्रेणी' : 'Connection Category',
        value: data.category === 'domestic' ? (isHi ? 'घरेलू' : 'Domestic') : (isHi ? 'वाणिज्यिक' : 'Commercial'),
        icon: '🏠',
        editStep: 'connection_type' as Step,
      },
      {
        label: isHi ? 'स्वामित्व' : 'Ownership',
        value: data.ownership === 'owner' ? (isHi ? 'मालिक' : 'Owner') : (isHi ? 'किरायेदार' : 'Tenant'),
        icon: '🔑',
        editStep: 'connection_type' as Step,
      },
      {
        label: isHi ? 'लोड श्रेणी' : 'Load Category',
        value: `${isHi ? data.loadLabelHi : data.loadLabel} (${LOAD_OPTIONS.find((o) => o.id === data.loadCategory)?.range})`,
        icon: '⚡',
        editStep: 'connection_type' as Step,
      },
      { label: isHi ? 'आवेदक' : 'Applicant', value: data.name, icon: '👤', editStep: 'applicant' as Step },
      { label: isHi ? 'पिता / पति' : 'Father / Spouse', value: data.fatherSpouseName, icon: '👨‍👩‍👦', editStep: 'applicant' as Step },
      { label: isHi ? 'मोबाइल' : 'Mobile', value: data.phone, icon: '📱', editStep: 'applicant' as Step },
      { label: isHi ? 'पता' : 'Address', value: getDisplayAddress(), icon: '📍', editStep: 'address' as Step },
    ];

    const docs = selectedDocuments
      .filter((sd) => sd.documentId || sd.file)
      .map((sd) => {
        const req = DOC_REQUIREMENTS.find((r) => r.id === sd.requirementId);
        const saved = citizen?.documents.find((d) => d.id === sd.documentId);
        return { name: saved?.name || sd.file?.name || (isHi ? req?.nameHi : req?.name) || '', status: sd.preCheckStatus };
      });

    return (
      <div className="space-y-6 animate-scale-in">
        {/* Review banner */}
        <div className="kiosk-card bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-300 dark:border-amber-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {isHi ? 'आवेदन की समीक्षा करें' : 'Review Your Application'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isHi ? 'कृपया सभी जानकारी की पुष्टि करें' : 'Please confirm all details before submitting'}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="kiosk-card space-y-0 divide-y divide-border">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between py-4 px-2 first:pt-0 last:pb-0">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <span>{row.icon}</span> {row.label}
              </span>
              <div className="flex items-center gap-3 max-w-[65%] justify-end">
                <span className="font-bold text-foreground text-right">{row.value}</span>
                <button
                  onClick={() => setStep(row.editStep)}
                  className="min-h-[64px] min-w-[64px] px-3 rounded-xl border-2 border-primary/40 hover:border-primary hover:bg-primary/10 text-primary font-bold transition-all active:scale-[0.98]"
                  aria-label={isHi ? 'संपादित करें' : 'Edit'}
                >
                  {isHi ? '✎' : 'Edit'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="kiosk-card">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
              <span>📄</span> {isHi ? 'संलग्न दस्तावेज़' : 'Attached Documents'}
            </h4>
            <button
              onClick={() => setStep('documents')}
              className="min-h-[64px] px-4 rounded-xl border-2 border-primary/40 hover:border-primary hover:bg-primary/10 text-primary font-bold transition-all active:scale-[0.98]"
            >
              {isHi ? 'दस्तावेज़ संपादित करें' : 'Edit Documents'}
            </button>
          </div>
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-success/5 border border-success/20">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground font-medium">{doc.name}</span>
                <span className="ml-auto text-xs font-bold text-success bg-success/10 px-3 py-1 rounded-full">
                  {isHi ? 'सत्यापित' : 'Verified'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acknowledgement */}
        <div className="kiosk-card border-primary/30 bg-primary/5">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              id="ack"
              checked={isAcknowledged}
              onChange={(e) => setIsAcknowledged(e.target.checked)}
              className="mt-1 w-6 h-6 rounded accent-primary"
            />
            <span className="text-foreground leading-relaxed">
              {isHi
                ? '✅ मैं पुष्टि करता/करती हूँ कि सभी जानकारी सही है। गलत जानकारी देने पर आवेदन अस्वीकार किया जा सकता है।'
                : '✅ I confirm all information is correct and accurate. Providing false information may result in rejection of the application.'}
            </span>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-2">
          <button onClick={goBack} className="flex-1 kiosk-btn-ghost flex items-center justify-center gap-2 text-lg">
            <span className="text-2xl">←</span> {isHi ? 'वापस' : 'Back'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isAcknowledged}
            className="flex-1 kiosk-btn-success flex items-center justify-center gap-2 text-lg font-bold hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isHi ? 'आवेदन जमा करें' : 'Submit Application'} <span className="text-2xl">✓</span>
          </button>
        </div>
      </div>
    );
  };

  // ─── Step 6: Success ────────────────────────────────
  const renderSuccess = () => (
    <div className="text-center animate-slide-up space-y-6">
      {/* Success animation */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center shadow-2xl animate-bounce-subtle">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-green-500 flex items-center justify-center">
            <span className="text-5xl text-white">✓</span>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-success/30 animate-ping" />
        </div>
      </div>

      <div>
        <h2 className="text-4xl font-black text-success mb-2">
          {isHi ? 'आवेदन जमा हो गया!' : 'Application Submitted!'}
        </h2>
        <p className="text-lg text-muted-foreground font-medium">
          {isHi
            ? '📱 पुष्टि SMS आपके पंजीकृत मोबाइल पर भेजा गया है।'
            : '📱 A confirmation SMS has been sent to your registered number.'}
        </p>
      </div>

      {/* Receipt card */}
      <div className="kiosk-card bg-gradient-to-b from-white to-muted/30 dark:from-card dark:to-muted/10 border-2 border-success/30 shadow-xl text-left">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-success/30">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-green-500/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {isHi ? 'आवेदन रसीद' : 'Application Receipt'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-success/5 border border-success/20">
            <span className="text-muted-foreground font-medium">{isHi ? '🆔 आवेदन ID' : '🆔 Application ID'}</span>
            <span className="font-mono font-black text-lg text-success">{applicationId}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-muted/30">
            <span className="text-muted-foreground font-medium">{isHi ? '📋 सेवा' : '📋 Service'}</span>
            <span className="font-bold text-foreground">{isHi ? 'नया बिजली कनेक्शन' : 'New Electricity Connection'}</span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-muted/30">
            <span className="text-muted-foreground font-medium">{isHi ? '⚡ लोड' : '⚡ Load'}</span>
            <span className="font-bold text-foreground">
              {isHi ? data.loadLabelHi : data.loadLabel} ({LOAD_OPTIONS.find((o) => o.id === data.loadCategory)?.range})
            </span>
          </div>
          <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-muted/30">
            <span className="text-muted-foreground font-medium">{isHi ? '⏳ स्थिति' : '⏳ Status'}</span>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-sm font-bold">
              {isHi ? 'समीक्षाधीन' : 'Pending Review'}
            </span>
          </div>
        </div>

        {/* Timeline info */}
        <div className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span>⏱️</span>
            {isHi ? 'अपेक्षित प्रसंस्करण समय: 7–10 कार्य दिवस' : 'Expected processing time: 7–10 working days'}
          </p>
        </div>
        <div className="mt-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <span>🔍</span>
            {isHi
              ? 'साइट निरीक्षण 3–5 दिनों में निर्धारित होगा। SMS द्वारा सूचित किया जाएगा।'
              : 'Site inspection will be scheduled within 3–5 days. You will be notified via SMS.'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="kiosk-btn-secondary flex flex-col items-center justify-center gap-2 py-5"
        >
          <span className="text-2xl">🖨️</span>
          <span className="text-sm font-bold">{isHi ? 'रसीद प्रिंट' : 'Print Receipt'}</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="kiosk-btn-ghost flex flex-col items-center justify-center gap-2 py-5"
        >
          <span className="text-2xl">🏠</span>
          <span className="text-sm font-bold">{isHi ? 'डैशबोर्ड' : 'Dashboard'}</span>
        </button>
        <button
          onClick={() => navigate('/status')}
          className="kiosk-btn-primary flex flex-col items-center justify-center gap-2 py-5"
        >
          <span className="text-2xl">📍</span>
          <span className="text-sm font-bold">{isHi ? 'स्थिति ट्रैक' : 'Track Status'}</span>
        </button>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────
  return (
    <KioskLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        {renderProgress()}
        {step === 'connection_type' && renderConnectionType()}
        {step === 'applicant' && renderApplicant()}
        {step === 'address' && renderAddress()}
        {step === 'documents' && renderDocuments()}
        {step === 'review' && renderReview()}
        {step === 'success' && renderSuccess()}
      </div>
    </KioskLayout>
  );
};

export default NewElectricityConnection;
