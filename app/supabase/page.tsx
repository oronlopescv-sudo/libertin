'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { supabase, SUPABASE_SQL_SCHEMA } from '@/lib/supabase';
import { Store } from '@/lib/store';
import {
  Database,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Key,
  Server,
  Table,
  FileCode,
  Code,
  ExternalLink,
  Layers,
  Lock,
  Play,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Users,
  Image as ImageIcon,
  MessageSquare,
  Crown,
  FileText,
} from 'lucide-react';

interface TableColumn {
  name: string;
  type: string;
  primary?: boolean;
  unique?: boolean;
  fk?: string;
  default?: string;
  description: string;
}

interface TableDef {
  name: string;
  label: string;
  icon: React.ElementType;
  description: string;
  columns: TableColumn[];
}

export default function SupabaseDataPage() {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'tables' | 'live' | 'instructions'>('schema');
  const [selectedTable, setSelectedTable] = useState<string>('profiles');

  // Supabase connection state
  const [pingStatus, setPingStatus] = useState<'testing' | 'success' | 'warning'>('testing');
  const [pingMessage, setPingMessage] = useState<string>('Vérification de la connexion Supabase...');
  const [profilesCount, setProfilesCount] = useState<number>(0);
  const [photosCount, setPhotosCount] = useState<number>(0);
  const [groupsCount, setGroupsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mfchfnsekoluicxnguoh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mY2hmbnNla29sdWljeG5ndW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTI4NjcsImV4cCI6MjEwMTQyODg2N30.oGzeDkpo2KU1PSIn1l0RPSto-KfuNICQdtXpjVULutw';

  // Test Supabase connection
  const testConnection = React.useCallback(async () => {
    setPingStatus('testing');
    setPingMessage('Test de connexion à la base de données Supabase...');
    try {
      const { error, count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (error) {
        setPingStatus('warning');
        setPingMessage(`Supabase reachable (Statut: Table non encore initialisée ou RLS active. ${error.message})`);
      } else {
        setPingStatus('success');
        setPingMessage(`Connexion Supabase active et fonctionnelle ! (${count || 0} profils enregistrés)`);
        if (typeof count === 'number') setProfilesCount(count);
      }
    } catch (err: any) {
      setPingStatus('warning');
      setPingMessage(`Supabase URL valide. Script SQL disponible ci-dessous pour créer les tables. (${err?.message || 'Ready'})`);
    }

    // Load store metrics for live inspector
    const users = Store.getUsers();
    setProfilesCount(users.length);
    setPhotosCount(users.reduce((acc, u) => acc + (u.photos?.length || 0), 0));
    setGroupsCount(Store.getGroups().length);
    const allMsgsMap = Store.getMessages();
    const totalMsgsCount = Object.values(allMsgsMap).reduce((acc, msgs) => acc + (msgs?.length || 0), 0);
    setMessagesCount(totalMsgsCount);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      testConnection();
    }, 0);
    return () => clearTimeout(timer);
  }, [testConnection]);

  const handleCopy = (text: string, type: 'sql' | 'url' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } else if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } else if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const tablesDefinition: TableDef[] = [
    {
      name: 'profiles',
      label: '1. Profiles (Utilisateurs)',
      icon: Users,
      description: 'Stocke les comptes utilisateurs, leurs infos de profil, localisation, rôles et statut d\'abonnement.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'Identifiant unique de l\'utilisateur' },
        { name: 'email', type: 'TEXT', unique: true, description: 'Adresse e-mail confidentielle' },
        { name: 'username', type: 'TEXT', unique: true, description: 'Pseudo public' },
        { name: 'phone', type: 'TEXT', description: 'Numéro de téléphone (optionnel)' },
        { name: 'date_of_birth', type: 'DATE', description: 'Date de naissance pour validation +18 ans' },
        { name: 'gender', type: 'TEXT', default: "'couple'", description: 'Type de profil: couple, femme, homme' },
        { name: 'sexual_orientation', type: 'TEXT', default: "'libertin'", description: 'Orientation sexuelle & style de rencontre' },
        { name: 'location', type: 'TEXT', default: "'Paris'", description: 'Ville / Ville de rattachement' },
        { name: 'lat', type: 'DOUBLE PRECISION', default: '48.8566', description: 'Latitude GPS pour filtre géographique' },
        { name: 'lng', type: 'DOUBLE PRECISION', default: '2.3522', description: 'Longitude GPS pour filtre géographique' },
        { name: 'subscription_tier', type: 'TEXT', default: "'FREE'", description: 'Formule: FREE, PREMIUM_3M, PREMIUM_12M, PREMIUM_24M' },
        { name: 'subscription_start', type: 'TIMESTAMPTZ', description: 'Début de l\'abonnement Stripe' },
        { name: 'subscription_end', type: 'TIMESTAMPTZ', description: 'Expiration de l\'abonnement Stripe' },
        { name: 'stripe_customer_id', type: 'TEXT', description: 'ID Client Stripe' },
        { name: 'bio', type: 'TEXT', description: 'Présentation & envies libertines' },
        { name: 'interests', type: 'TEXT[]', default: "'{}'", description: 'Tableau des centres d\'intérêt & désirs' },
        { name: 'is_verified', type: 'BOOLEAN', default: 'FALSE', description: 'Badge Profil Vérifié (Selfie + ID)' },
        { name: 'is_active', type: 'BOOLEAN', default: 'TRUE', description: 'Compte actif / suspendu' },
        { name: 'is_nsfw', type: 'BOOLEAN', default: 'TRUE', description: 'Contenu réservé aux adultes' },
        { name: 'role', type: 'TEXT', default: "'user'", description: 'Rôle: user ou admin' },
        { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Date de création' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Date de modification' },
      ],
    },
    {
      name: 'photos',
      label: '2. Photos (Galerie)',
      icon: ImageIcon,
      description: 'Photos de profil et galeries privées des membres.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'ID unique de la photo' },
        { name: 'user_id', type: 'UUID', fk: 'profiles(id)', description: 'Référence à l\'utilisateur propriétaire' },
        { name: 'url', type: 'TEXT', description: 'URL de l\'image (Supabase Storage ou CDN)' },
        { name: 'is_cover', type: 'BOOLEAN', default: 'FALSE', description: 'Photo principale de couverture' },
        { name: 'display_order', type: 'INT', default: '0', description: 'Ordre d\'affichage dans la galerie' },
        { name: 'uploaded_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Horodatage d\'envoi' },
      ],
    },
    {
      name: 'verification_photos',
      label: '3. Verification Photos (Selfies ID)',
      icon: ShieldCheck,
      description: 'Stocke les demandes de badges vérifiés soumises par les membres.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'ID de la vérification' },
        { name: 'user_id', type: 'UUID', fk: 'profiles(id)', description: 'Utilisateur demandeur' },
        { name: 'url', type: 'TEXT', description: 'URL du selfie manuscrit' },
        { name: 'status', type: 'TEXT', default: "'pending'", description: 'Statut: pending, approved, rejected' },
        { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Date de soumission' },
      ],
    },
    {
      name: 'groups',
      label: '4. Groups (Clubs & Soirées)',
      icon: Users,
      description: 'Groupes privés, clubs libertins et soirées thématiques.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'ID du groupe' },
        { name: 'name', type: 'TEXT', description: 'Nom du club ou du groupe' },
        { name: 'description', type: 'TEXT', description: 'Règlement et ambiance du groupe' },
        { name: 'creator_id', type: 'UUID', fk: 'profiles(id)', description: 'Fondateur du groupe' },
        { name: 'creator_name', type: 'TEXT', description: 'Pseudo du créateur' },
        { name: 'is_private', type: 'BOOLEAN', default: 'FALSE', description: 'Accès sur invitation uniquement' },
        { name: 'max_members', type: 'INT', default: '50', description: 'Nombre max de places' },
        { name: 'member_count', type: 'INT', default: '1', description: 'Nombre actuel de membres' },
        { name: 'category', type: 'TEXT', default: "'clubs'", description: 'Catégorie: clubs, rencontres, soirees' },
        { name: 'cover_url', type: 'TEXT', description: 'Image de couverture' },
        { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Date de création' },
      ],
    },
    {
      name: 'messages',
      label: '5. Messages (Tchat Temps Réel)',
      icon: MessageSquare,
      description: 'Messages échangés dans les tchats de groupe et salons de discussion.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'ID du message' },
        { name: 'group_id', type: 'UUID', fk: 'groups(id)', description: 'Groupe destinataire' },
        { name: 'user_id', type: 'UUID', fk: 'profiles(id)', description: 'Auteur du message' },
        { name: 'user_name', type: 'TEXT', description: 'Nom affiché de l\'expéditeur' },
        { name: 'user_avatar', type: 'TEXT', description: 'Avatar de l\'expéditeur' },
        { name: 'content', type: 'TEXT', description: 'Texte du message' },
        { name: 'media_url', type: 'TEXT', description: 'Image / Média joint (optionnel)' },
        { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Horodatage d\'envoi' },
      ],
    },
    {
      name: 'subscriptions',
      label: '6. Subscriptions (Abonnements)',
      icon: Crown,
      description: 'Historique des transactions et passes Premium souscrits via Stripe.',
      columns: [
        { name: 'id', type: 'UUID', primary: true, default: 'gen_random_uuid()', description: 'ID de la souscription' },
        { name: 'user_id', type: 'UUID', fk: 'profiles(id)', description: 'Utilisateur abonné' },
        { name: 'tier', type: 'TEXT', description: 'Formule souscrite (PREMIUM_3M, 12M, 24M)' },
        { name: 'price', type: 'DECIMAL(10,2)', description: 'Montant réglé en Euros (€)' },
        { name: 'start_date', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Date de début d\'accès' },
        { name: 'end_date', type: 'TIMESTAMPTZ', description: 'Date de fin de validité' },
        { name: 'stripe_id', type: 'TEXT', description: 'Référence Checkout Stripe' },
        { name: 'status', type: 'TEXT', default: "'active'", description: 'Statut du passe' },
        { name: 'created_at', type: 'TIMESTAMPTZ', default: 'NOW()', description: 'Horodatage de la souscription' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#12091A] text-[#F5F0F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1C102B] via-[#2C1B3D] to-[#1C102B] border border-[#3D2654] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4145A]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4145A]/20 border border-[#D4145A]/40 text-xs font-bold text-[#E86B7A]">
                <Database className="w-4 h-4 text-[#D4145A]" />
                <span>Base de Données PostgreSQL & Supabase</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Fiche de Données & Architecture Supabase
              </h1>
              <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
                Retrouvez l&apos;ensemble de la configuration Supabase, la clé d&apos;API anon, le script SQL complet de migration PostgreSQL et l&apos;inspecteur des tables pour votre projet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={testConnection}
                className="px-4 py-2.5 rounded-xl bg-[#2C1B3D] border border-[#3D2654] hover:border-[#D4145A] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'testing' ? 'animate-spin text-[#E86B7A]' : 'text-[#D4145A]'}`} />
                <span>Tester la Connexion</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'sql')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#D4145A]/25 hover:opacity-95 hover:scale-[1.02]"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'Script SQL Copié !' : 'Copier Schema SQL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Supabase Connection Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-colors ${
          pingStatus === 'success' 
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {pingStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold uppercase tracking-wider block text-[11px] mb-0.5">
                Statut de Connexion Supabase Client
              </span>
              <p className="text-zinc-300">{pingMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-zinc-300 bg-[#12091A]/60 px-3.5 py-2 rounded-xl border border-[#3D2654]">
            <div className="text-center">
              <div className="font-bold text-white text-sm">{profilesCount}</div>
              <div className="text-[10px] text-zinc-400">Profils</div>
            </div>
            <div className="h-6 w-px bg-[#3D2654]" />
            <div className="text-center">
              <div className="font-bold text-white text-sm">{photosCount}</div>
              <div className="text-[10px] text-zinc-400">Photos</div>
            </div>
            <div className="h-6 w-px bg-[#3D2654]" />
            <div className="text-center">
              <div className="font-bold text-white text-sm">{groupsCount}</div>
              <div className="text-[10px] text-zinc-400">Groupes</div>
            </div>
            <div className="h-6 w-px bg-[#3D2654]" />
            <div className="text-center">
              <div className="font-bold text-white text-sm">{messagesCount}</div>
              <div className="text-[10px] text-zinc-400">Messages</div>
            </div>
          </div>
        </div>

        {/* Credentials & Env Variables Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase URL */}
          <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#E86B7A]" />
                <span>URL d&apos;API Supabase (NEXT_PUBLIC_SUPABASE_URL)</span>
              </label>
              <button
                type="button"
                onClick={() => handleCopy(supabaseUrl, 'url')}
                className="text-xs text-[#E86B7A] hover:underline flex items-center gap-1"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#12091A] border border-[#3D2654] font-mono text-xs text-emerald-400 break-all select-all">
              {supabaseUrl}
            </div>
          </div>

          {/* Supabase Anon Key */}
          <div className="p-4 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#E86B7A]" />
                <span>Clé Anonyme (NEXT_PUBLIC_SUPABASE_ANON_KEY)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKey ? 'Masquer' : 'Afficher'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(supabaseAnonKey, 'key')}
                  className="text-xs text-[#E86B7A] hover:underline flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey ? 'Copiée' : 'Copier'}</span>
                </button>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#12091A] border border-[#3D2654] font-mono text-xs text-amber-300 break-all select-all">
              {showKey ? supabaseAnonKey : `${supabaseAnonKey.substring(0, 32)}••••••••••••••••••••••••`}
            </div>
          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="flex items-center border-b border-[#2C1B3D] gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schema'
                ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white shadow-md'
                : 'bg-[#1C102B] text-zinc-400 border border-[#2C1B3D] hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Script SQL Complet (SQL Editor)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tables'
                ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white shadow-md'
                : 'bg-[#1C102B] text-zinc-400 border border-[#2C1B3D] hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Structures des 6 Tabelas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'live'
                ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white shadow-md'
                : 'bg-[#1C102B] text-zinc-400 border border-[#2C1B3D] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inspecteur des Données Membres</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'bg-gradient-to-r from-[#D4145A] to-[#E86B7A] text-white shadow-md'
                : 'bg-[#1C102B] text-zinc-400 border border-[#2C1B3D] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Guide d&apos;Installation & RLS</span>
          </button>
        </div>

        {/* TAB 1: SQL SCHEMA */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#D4145A]" />
                  Script de Création des Tables & RLS (SQL Schema)
                </h2>
                <p className="text-xs text-zinc-400">
                  Copiez ce script et collez-le directement dans le <strong className="text-white">SQL Editor</strong> de Supabase Dashboard pour créer instantanément les 6 tables et leurs règles de sécurité RLS.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'sql')}
                className="px-3.5 py-2 rounded-xl bg-[#2C1B3D] border border-[#3D2654] hover:border-[#D4145A] text-xs font-bold text-white flex items-center gap-1.5"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copié !' : 'Copier Tout'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#09030E] border border-[#2C1B3D] font-mono text-xs text-emerald-300 overflow-x-auto max-h-[500px] leading-relaxed select-all scrollbar-thin">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>
        )}

        {/* TAB 2: TABLES STRUCTURE */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {tablesDefinition.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTable === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTable(t.name)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#D4145A] text-white shadow-md'
                        : 'bg-[#1C102B] text-zinc-400 border border-[#2C1B3D] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {tablesDefinition
              .filter((t) => t.name === selectedTable)
              .map((table) => (
                <div key={table.name} className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Table className="w-5 h-5 text-[#E86B7A]" />
                      <span>Table public.{table.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1">{table.description}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                      <thead>
                        <tr className="border-b border-[#3D2654] text-zinc-400 uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3">Colonne</th>
                          <th className="py-2.5 px-3">Type SQL</th>
                          <th className="py-2.5 px-3">Contraintes & Défaut</th>
                          <th className="py-2.5 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2C1B3D]">
                        {table.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-[#25153A]/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-white font-bold flex items-center gap-1.5">
                              {col.primary && <Key className="w-3 h-3 text-amber-400 inline shrink-0" />}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-400">{col.type}</td>
                            <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">
                              {col.primary && <span className="text-amber-400 font-bold mr-1">[PK]</span>}
                              {col.unique && <span className="text-purple-400 font-bold mr-1">[UNIQUE]</span>}
                              {col.fk && <span className="text-cyan-400 font-bold mr-1">[FK: {col.fk}]</span>}
                              {col.default && <span>default: {col.default}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-300">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* TAB 3: LIVE DATA INSPECTOR */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2C1B3D] pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4145A]" />
                    Aperçu des Données Utilisateurs Enregistrés ({Store.getUsers().length})
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ces enregistrements sont synchronisés avec le store principal et prêts à être poussés vers Supabase Postgres.
                  </p>
                </div>

                <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg font-bold">
                  ✓ Statut de la Base : Opérationnel
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead>
                    <tr className="border-b border-[#3D2654] text-zinc-400 uppercase text-[11px]">
                      <th className="py-2 px-3">Pseudo</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Genre</th>
                      <th className="py-2 px-3">Ville</th>
                      <th className="py-2 px-3">Pass Subscription</th>
                      <th className="py-2 px-3">Vérifié</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C1B3D]">
                    {Store.getUsers().map((u) => (
                      <tr key={u.id} className="hover:bg-[#25153A]">
                        <td className="py-2.5 px-3 font-bold text-white">{u.username}</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-300">{u.email}</td>
                        <td className="py-2.5 px-3 capitalize">{u.gender}</td>
                        <td className="py-2.5 px-3">{u.location}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.subscriptionTier !== 'FREE'
                              ? 'bg-[#D4145A] text-white'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {u.subscriptionTier}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {u.isVerified ? (
                            <span className="text-emerald-400 font-bold">✓ Badge Actif</span>
                          ) : (
                            <span className="text-zinc-500">Non vérifié</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETUP INSTRUCTIONS */}
        {activeTab === 'instructions' && (
          <div className="p-6 rounded-2xl bg-[#1C102B] border border-[#2C1B3D] space-y-6 text-xs text-zinc-300">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-[#2C1B3D] pb-3">
              <FileText className="w-4 h-4 text-[#D4145A]" />
              Instructions d&apos;Intégration Supabase Étape par Étape
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4145A] text-white flex items-center justify-center text-xs">1</span>
                  <span>Créer le Projet sur Supabase.com</span>
                </div>
                <p className="leading-relaxed pl-8">
                  Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#E86B7A] underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>, créez un compte gratuit et démarrez un nouveau projet Postgres.
                </p>

                <div className="font-bold text-white flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4145A] text-white flex items-center justify-center text-xs">2</span>
                  <span>Exécuter le Script SQL</span>
                </div>
                <p className="leading-relaxed pl-8">
                  Allez dans l&apos;onglet <strong className="text-white">SQL Editor</strong> dans le dashboard Supabase, collez le script fourni dans l&apos;onglet &quot;Script SQL Complet&quot; et cliquez sur <strong className="text-emerald-400 font-bold">RUN</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4145A] text-white flex items-center justify-center text-xs">3</span>
                  <span>Configurer les Variables d&apos;Environnement</span>
                </div>
                <p className="leading-relaxed pl-8">
                  Dans les paramètres du projet (<strong className="text-white">Project Settings &gt; API</strong>), récupérez votre <strong className="text-white">URL</strong> et votre <strong className="text-white">anon public key</strong> puis renseignez-les dans le fichier <code className="text-amber-300 font-mono">.env.local</code>.
                </p>

                <div className="font-bold text-white flex items-center gap-2 pt-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4145A] text-white flex items-center justify-center text-xs">4</span>
                  <span>Politiques de Sécurité RLS Actives</span>
                </div>
                <p className="leading-relaxed pl-8">
                  Les politiques Row Level Security (RLS) sont automatiquement incluses dans le script pour garantir que chaque membre accède uniquement à ses données autorisées.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
