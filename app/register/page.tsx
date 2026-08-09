'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GenderType, SexualOrientationType } from '@/lib/types';
import { CITIES, COUNTRIES } from '@/lib/geo';
import {
  Flame,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Heart,
  MapPin,
  Upload,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  // const { ... } = useAuth();
  const user = null;
  const usersList = [];
  const isPremium = false;
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1994-05-15');
  const [gender, setGender] = useState<GenderType>('couple');
  const [sexualOrientation, setSexualOrientation] = useState<SexualOrientationType>('libertin');

  // Step 2 State
  const [location, setLocation] = useState('Paris');
  const [bio, setBio] = useState('Couple ouvert d\'esprit, respectueux et chaleureux. Nous aimons l\'élégance des sorties nocturnes et la complicité des discussions intimes.');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Clubs libertins',
    'Soirées privées',
    'Échangisme soft',
  ]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const INTEREST_OPTIONS = [
    'Clubs libertins',
    'Soirées privées',
    'Échangisme soft',
    'Mélangisme',
    'Voyeurisme',
    'Cocktails & Lounges',
    'Discrétion',
    'Savoir-vivre',
    'Soirées en villa',
  ];

  const handleInterestToggle = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Age check: must be 18+
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    if (age < 18 || isNaN(age)) {
      setErrorMsg('Accès strictement interdit aux personnes de moins de 18 ans.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMsg('Vous devez accepter les conditions d\'utilisation et certifier avoir plus de 18 ans.');
      return;
    }

    const cityCoords = CITIES[location] || { lat: 48.8566, lng: 2.3522 };

    setErrorMsg('');
    try {
      await register({
        email,
        username,
        password,
        dateOfBirth,
        age: new Date().getFullYear() - new Date(dateOfBirth).getFullYear(),
        gender,
        sexualOrientation,
        location,
        lat: cityCoords.lat,
        lng: cityCoords.lng,
        bio,
        interests: selectedInterests,
        subscriptionTier: 'FREE',
        photos: photoUrl ? [{ id: `photo-${Date.now()}`, userId: '', url: photoUrl, isCover: true, order: 0, uploadedAt: new Date().toISOString() }] : [],
      });
      router.push('/decouvrir');
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl bg-[#1C102B] border border-[#2C1B3D] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D4145A] to-[#E86B7A] flex items-center justify-center mx-auto shadow-lg shadow-[#D4145A]/25">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Rejoindre xlibertine</h1>
            <p className="text-xs text-zinc-400">
              Inscription en 2 étapes — 100% Confidentielle et Sécurisée
            </p>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div
                className={`w-8 h-2 rounded-full transition-all ${
                  step === 1 ? 'bg-[#D4145A]' : 'bg-[#2C1B3D]'
                }`}
              />
              <div
                className={`w-8 h-2 rounded-full transition-all ${
                  step === 2 ? 'bg-[#D4145A]' : 'bg-[#2C1B3D]'
                }`}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1 FORM */
            <form onSubmit={handleNextStep} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Je m&apos;inscris en tant que :</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'couple', label: 'Couple Libertin' },
                    { id: 'femme', label: 'Femme Solo' },
                    { id: 'homme', label: 'Homme Solo' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setGender(item.id as GenderType)}
                      className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                        gender === item.id
                          ? 'bg-[#D4145A] text-white border-[#D4145A]'
                          : 'bg-[#12091A] text-zinc-400 border-[#3D2654]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Pseudo public</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: DuoInsolite_75"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Date de naissance (+18 ans)</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Adresse E-mail confidentielle</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.fr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Mot de passe fort</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Orientation & Style de rencontre</label>
                <select
                  value={sexualOrientation}
                  onChange={(e) => setSexualOrientation(e.target.value as SexualOrientationType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                >
                  <option value="libertin">Libertin / Ouvert à tout</option>
                  <option value="hetero">Hétérosexuel(le)</option>
                  <option value="bi">Bisexuel(le)</option>
                  <option value="homo">Homosexuel(le)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25 flex items-center justify-center gap-2 mt-4"
              >
                <span>Étape Suivante (Profil & Interêts)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2 FORM */
            <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Ville / Localisation</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                >
                  {COUNTRIES.filter((c) => c.code !== 'ALL').map((c) => (
                    <optgroup key={c.code} label={`${c.flag} ${c.name}`}>
                      {Object.values(CITIES)
                        .filter((ci) => ci.country === c.name)
                        .map((ci) => (
                          <option key={ci.name} value={ci.name}>
                            {ci.flag} {ci.name} ({ci.country})
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Présentation / Bio (minimum 50 caractères)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Décrivez vos envies, votre savoir-vivre et ce que vous recherchez..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-2">Envies & Centres d&apos;intérêt</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((item) => {
                    const active = selectedInterests.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => handleInterestToggle(item)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          active
                            ? 'bg-[#D4145A] text-white border-[#D4145A]'
                            : 'bg-[#12091A] text-zinc-400 border-[#3D2654]'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Verification Upload Optional Preview */}
              <div className="p-3.5 rounded-2xl bg-[#2C1B3D] border border-[#3D2654] space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Photo de Vérification (Recommandée)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Transmettez un selfie avec mot manuscrit pour obtenir le badge Profil Vérifié immédiatement après inscription.
                </p>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#12091A] border border-dashed border-[#3D2654] hover:border-[#D4145A] cursor-pointer text-zinc-300 text-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#E86B7A]" />
                    <span>{photoUrl ? "Image chargée" : "Choisir une photo depuis votre appareil"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <input
                    type="text"
                    placeholder="ou coller le lien d'image selfie"
                    value={photoUrl.startsWith('data:image') ? '' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-white"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#3D2654] bg-[#12091A] text-[#D4145A] focus:ring-0"
                />
                <label htmlFor="terms" className="text-[11px] text-zinc-400 leading-snug">
                  Je certifie avoir plus de 18 ans, j&apos;accepte la charte de respect & discrétion et les Conditions Générales d&apos;Utilisation de xlibertine.
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl bg-[#2C1B3D] text-zinc-300 font-bold hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finaliser mon Inscription Gratuitement</span>
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-zinc-400 pt-2 border-t border-[#2C1B3D]">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-[#E86B7A] font-bold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
