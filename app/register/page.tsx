'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useAuth } from '@/context/auth-context';
import { GenderType, SexualOrientationType } from '@/lib/types';
import { CITIES, COUNTRIES } from '@/lib/geo';
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Upload,
  MailCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

/** Mot de passe mínimo (o fluxo "password esquecida" exige 8 — alinhados). */
const MOT_DE_PASSE_MIN = 8;

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);

  // Déjà connecté : proposer de créer un compte n'a aucun sens. Sans cette
  // redirection, la navbar affiche le compte connecté pendant que la page
  // demande de s'inscrire — le site paraît incohérent.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/decouvrir');
    }
  }, [authLoading, user, router]);

  // Form State — AUCUN champ pré-rempli : l'ancienne version partait de
  // données fictives (naissance « 1994-05-15 », bio rédigée, 3 goûts
  // déjà cochés, ville Paris) avec lesquelles la personne pouvait s'inscrire
  // sans se rendre compte qu'elle publiait un faux profil.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<GenderType>('couple');
  const [sexualOrientation, setSexualOrientation] = useState<SexualOrientationType>('libertin');

  // Step 2 State
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [photoErreur, setPhotoErreur] = useState('');
  // Inscription aboutie avec e-mail de confirmation à valider : on remplace
  // le formulaire par un écran de réussite vert, jamais une « erreur ».
  const [inscriptionValidee, setInscriptionValidee] = useState('');
  const [montrerMotDePasse, setMontrerMotDePasse] = useState(false);
  const [processando, setProcessando] = useState(false);

  // Pseudo public : disponibilité vérifiée EN DIRECT à la frappe. Sans
  // cela, un pseudo déjà pris n'apparaissait qu'à la toute dernière étape
  // — tout le formulaire perdu pour rien.
  type EstadoPseudo = 'nada' | 'verificando' | 'livre' | 'ocupado';
  const [estadoPseudo, setEstadoPseudo] = useState<EstadoPseudo>('nada');
  const [sugestaoPseudo, setSugestaoPseudo] = useState('');
  const [reenvioEmail, setReenvioEmail] = useState<'parado' | 'a-enviar' | 'enviado'>('parado');
  const [contagemEmail, setContagemEmail] = useState(0);
  const topoRef = useRef<HTMLDivElement>(null);

  const verificarPseudo = React.useCallback(async (candidato: string): Promise<EstadoPseudo> => {
    if (candidato.trim().length < 2 || candidato.trim().length > 24) return 'nada';
    try {
      const resposta = await fetch(`/api/auth/check-username?username=${encodeURIComponent(candidato.trim())}`);
      const dados = await resposta.json();
      if (dados.sugestao) setSugestaoPseudo(dados.sugestao);
      else setSugestaoPseudo('');
      return dados.disponivel ? 'livre' : 'ocupado';
    } catch {
      return 'nada'; // panne : ne pas punir, le serveur revalidera
    }
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    if (username.trim().length < 2 || username.trim().length > 24) {
      setEstadoPseudo('nada');
      setSugestaoPseudo('');
      return;
    }
    setEstadoPseudo('verificando');
    const tempo = setTimeout(async () => {
      const estado = await verificarPseudo(username);
      setEstadoPseudo(estado);
    }, 450);
    return () => clearTimeout(tempo);
  }, [username, step, verificarPseudo]);

  const afficherErreur = (msg: string) => {
    setErrorMsg(msg);
    // Sans ceci, l'erreur s'affiche en haut de la page pendant que la
    // personne est en train de remplir le bas d'un long formulaire — elle
    // ne la voit jamais et croit que le bouton ne fait rien.
    requestAnimationFrame(() => {
      topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

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
      afficherErreur('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Pseudo já tomado: recusar já na etapa 1 em vez de no final.
    if (estadoPseudo === 'ocupado') {
      afficherErreur(`Le pseudo « ${username} » est déjà pris.${sugestaoPseudo ? ` Suggestion libre : ${sugestaoPseudo}` : ''}`);
      return;
    }

    // Mot de passe : signaler a regra ANTES do servidor (Supabase recusa
    // com uma mensagem inglesa pouco compreensível).
    if (password.length < MOT_DE_PASSE_MIN) {
      afficherErreur(
        `Votre mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.`
      );
      return;
    }

    // Age check: must be 18+
    if (!dateOfBirth) {
      afficherErreur('Indiquez votre date de naissance pour certifier vos 18 ans.');
      return;
    }
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    if (age < 18 || isNaN(age)) {
      afficherErreur('Accès strictement interdit aux personnes de moins de 18 ans.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      afficherErreur('Cochez la case pour certifier vos 18 ans et accepter les conditions.');
      return;
    }
    // Une présentation complète est obligatoire : un profil vide n'a aucune
    // valeur pour les autres membres.
    if (bio.trim().length < 50) {
      afficherErreur('Votre présentation doit contenir au moins 50 caractères.');
      return;
    }
    // La ville doit être un choix explicite — plus de repli caché sur Paris.
    if (!location || !CITIES[location]) {
      afficherErreur('Choisissez votre ville dans la liste.');
      return;
    }

    const cityCoords = CITIES[location];

    setErrorMsg('');
    setProcessando(true);
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
      // Inscription réussie mais e-mail de confirmation attendu : le contexte
      // marque cette erreur `infoNotification` — on l'affiche comme une
      // réussite (vert), pas comme un échec (rouge).
      if (err?.infoNotification) {
        setErrorMsg('');
        setInscriptionValidee(err.message);
        return;
      }
      afficherErreur(err?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setProcessando(false);
    }
  };

  // Renvoi de l'e-mail de confirmation depuis l'écran de réussite.
  const reenviarEmailConfirmacao = async () => {
    setReenvioEmail('a-enviar');
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const dados = await res.json();
      if (res.ok) {
        setReenvioEmail('enviado');
        setContagemEmail(60);
        const horario = setInterval(() => {
          setContagemEmail(c => {
            if (c <= 1) {
              clearInterval(horario);
              setReenvioEmail('parado');
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      } else {
        setReenvioEmail('parado');
        afficherErreur(dados.error || "Le renvoi de l'e-mail a échoué.");
      }
    } catch {
      setReenvioEmail('parado');
      afficherErreur("Le renvoi de l'e-mail a échoué.");
    }
  };

  // Pendant la vérification de session, ou si une session existe déjà (la
  // redirection ci-dessus est en cours), on n'affiche pas le formulaire.
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
        <Navbar />
      </div>
    );
  }

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

            {/* Step Indicator — masqué sur l'écran de réussite */}
            {!inscriptionValidee && (
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
            )}
          </div>

          <div ref={topoRef} />

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/40 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {inscriptionValidee ? (
            // Écran de réussite : le compte est créé, reste à confirmer
            // l'e-mail. Un formulaire affiché à ce stade ferait croire que
            // l'inscription n'a pas « pris ».
            <div className="rounded-2xl bg-emerald-950/50 border border-emerald-700/50 p-6 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center mx-auto">
                <MailCheck className="w-7 h-7 text-emerald-300" />
              </div>
              <div className="space-y-2">
                <p className="text-emerald-200 font-extrabold text-lg">Inscription réussie !</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{inscriptionValidee}</p>
                <p className="text-[11px] text-zinc-500">
                  Rien reçu sous quelques minutes ? Regardez le dossier spam / indésirables.
                </p>
                {inscriptionValidee && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={reenviarEmailConfirmacao}
                      disabled={reenvioEmail === 'a-enviar' || (reenvioEmail === 'enviado' && contagemEmail > 0)}
                      className="text-[11px] text-emerald-300 underline hover:text-white transition-colors disabled:opacity-60"
                    >
                      {reenvioEmail === 'a-enviar' && "Renvoi en cours…"}
                      {reenvioEmail === 'enviado' &&
                        (contagemEmail > 0
                          ? `E-mail renvoyé (nouveau renvoi dans ${contagemEmail}s)`
                          : 'E-mail renvoyé')}
                      {reenvioEmail === 'parado' && "Pas d'e-mail reçu ? Renvoyer l'e-mail de confirmation"}
                    </button>
                  </div>
                )}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : step === 1 ? (
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
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ex: DuoInsolite_75"
                      maxLength={24}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                    />
                    {/* Verificação em tempo real da disponibilidade */}
                    <span
                      className={`absolute right-3 top-3 w-2.5 h-2.5 rounded-full transition-all ${
                        estadoPseudo === 'verificando'
                          ? 'animate-pulse bg-zinc-400'
                          : estadoPseudo === 'livre'
                            ? 'bg-emerald-400'
                            : estadoPseudo === 'ocupado'
                              ? 'bg-rose-500'
                              : 'bg-[#3D2654]'
                      }`}
                      aria-label={
                        estadoPseudo === 'livre'
                          ? 'Pseudo disponible'
                          : estadoPseudo === 'ocupado'
                            ? 'Pseudo déjà pris'
                            : undefined
                      }
                    />
                  </div>
                  {estadoPseudo === 'ocupado' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (sugestaoPseudo) setUsername(sugestaoPseudo);
                        setEstadoPseudo('nada');
                      }}
                      className="text-rose-400 mt-1 hover:text-white transition-colors text-left"
                    >
                      {sugestaoPseudo
                        ? `Déjà pris — ${sugestaoPseudo} est libre — cliquez pour l'utiliser`
                        : 'Déjà pris — essayez un autre'}
                    </button>
                  )}
                  {estadoPseudo === 'livre' && (
                    <p className="text-emerald-400 mt-1 text-left">Pseudo disponible ✓</p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Date de naissance (+18 ans)</label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Adresse e-mail confidentielle</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.fr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                />
                <p className="text-zinc-500 mt-1">
                  Jamais affichée sur le site : elle sert uniquement à vous connecter et à récupérer votre compte.
                </p>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={montrerMotDePasse ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-[#12091A] border border-[#3D2654] text-white focus:outline-none focus:border-[#D4145A]"
                  />
                  <button
                    type="button"
                    onClick={() => setMontrerMotDePasse(v => !v)}
                    aria-label={montrerMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-2 top-1.5 p-1 text-zinc-500 hover:text-white transition-colors"
                  >
                    {montrerMotDePasse ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-zinc-500 mt-1">
                  {MOT_DE_PASSE_MIN} caractères minimum. C&apos;est la clé de votre compte : mémorisez-la.
                </p>
                {/* Medidor de força — 4 níveis, sem biblioteca adicional */}
                {password.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {[0, 1, 2, 3].map((nivel) => {
                      let pontos = 0;
                      if (password.length >= MOT_DE_PASSE_MIN) pontos++;
                      if (password.length >= 12) pontos++;
                      if (/[A-Z]/.test(password) && /[a-z]/.test(password)) pontos++;
                      if (/\d/.test(password)) pontos++;
                      if (/[^\w\s]/.test(password)) pontos++;
                      const nivelAtual = Math.min(4, Math.ceil(pontos / 1.25)) - 1;
                      const cor =
                        nivelAtual <= 0
                          ? 'bg-rose-600'
                          : nivelAtual === 1
                            ? 'bg-amber-500'
                            : nivelAtual === 2
                              ? 'bg-yellow-400'
                              : 'bg-emerald-400';
                      return (
                        <div
                          key={nivel}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            nivel <= nivelAtual ? cor : 'bg-[#2C1B3D]'
                          }`}
                        />
                      );
                    })}
                    <span className="text-zinc-500 text-[10px] w-16 text-right">
                      {password.length < MOT_DE_PASSE_MIN
                        ? 'Trop courte'
                        : 'Force'}
                    </span>
                  </div>
                )}
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
                <span>Étape Suivante (Profil & Intérêts)</span>
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
                  <option value="" disabled>
                    Sélectionnez votre ville…
                  </option>
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
                <label className="block text-zinc-300 font-medium mb-1">
                  Présentation <span className="text-zinc-500">({bio.trim().length}/50 caractères minimum)</span>
                </label>
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

              {/* Photo optionnelle : le badge passe par une vraie modération,
                  pas par la simple présence d'un selfie. On ne promet plus un
                  « badge immédiat » qui n'a jamais existé. */}
              <div className="p-3.5 rounded-2xl bg-[#2C1B3D] border border-[#3D2654] space-y-2">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Photo de vérification (optionnelle)</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Un selfie vous permet de demander le badge « Profil vérifié » : votre demande est
                  ensuite examinée par notre équipe de modération. Votre selfie reste strictement
                  confidentiel — visible uniquement par la modération et détruit après examen.
                  Vous pouvez aussi l&apos;envoyer plus tard depuis votre profil.
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
                        e.target.value = '';
                        if (!file) return;

                        // Une photo de téléphone à pleine résolution peut
                        // faire plusieurs Mo. Une fois encodée en base64,
                        // elle peut dépasser la taille de requête acceptée
                        // par Supabase et faire échouer toute l'inscription
                        // sans message clair. On refuse tôt, avec une raison.
                        const LIMITE_MO = 3;
                        if (file.size > LIMITE_MO * 1024 * 1024) {
                          setPhotoErreur(
                            `Cette photo dépasse ${LIMITE_MO} Mo. Choisissez une photo plus légère, ou passez cette étape — vous pourrez l'ajouter depuis votre profil après inscription.`
                          );
                          return;
                        }

                        setPhotoErreur('');
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  {photoErreur && (
                    <p className="text-[11px] text-rose-400">{photoErreur}</p>
                  )}

                  <input
                    type="text"
                    placeholder="ou coller le lien d'image selfie"
                    value={photoUrl.startsWith('data:image') ? '' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#12091A] border border-[#3D2654] text-white"
                  />
                </div>
              </div>

              {/* Terms Checkbox — les deux textes doivent être lisibles AVANT
                  de cocher, avec lien : une simple mention sans lien n'est
                  pas une information. */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#3D2654] bg-[#12091A] text-[#D4145A] focus:ring-0"
                />
                <label htmlFor="terms" className="text-[11px] text-zinc-400 leading-snug">
                  Je certifie avoir plus de 18 ans et j&apos;accepte les{' '}
                  <Link href="/conditions-generales" target="_blank" className="text-[#E86B7A] underline hover:text-white">
                    Conditions Générales d&apos;Utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/politique-confidentialite" target="_blank" className="text-[#E86B7A] underline hover:text-white">
                    Politique de confidentialité
                  </Link>{' '}
                  de xlibertine.
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={processando}
                  className="px-4 py-3 rounded-xl bg-[#2C1B3D] text-zinc-300 font-bold hover:text-white flex items-center gap-1 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>

                <button
                  type="submit"
                  disabled={processando}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white font-bold text-xs hover:opacity-95 shadow-lg shadow-[#D4145A]/25 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{processando ? 'Création du compte…' : 'Finaliser mon inscription'}</span>
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
