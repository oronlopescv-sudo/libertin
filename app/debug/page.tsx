'use client';

export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>🔍 DEBUG PAGE</h1>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc' }}>
        <h3>Environment Variables:</h3>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {url ? '✅ CARREGADO' : '❌ VAZIO'}</p>
        {url && <p style={{fontSize: '12px', color: '#666'}}>{url.substring(0, 30)}...</p>}
        
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {anonKey ? '✅ CARREGADO' : '❌ VAZIO'}</p>
        {anonKey && <p style={{fontSize: '12px', color: '#666'}}>{anonKey.substring(0, 30)}...</p>}
        
        <p><strong>SUPABASE_SERVICE_ROLE_KEY:</strong> {serviceKey ? '✅ CARREGADO' : '❌ VAZIO'}</p>
        {serviceKey && <p style={{fontSize: '12px', color: '#666'}}>{serviceKey.substring(0, 30)}...</p>}
        
        <p><strong>NEXT_PUBLIC_APP_URL:</strong> {appUrl ? '✅ CARREGADO' : '❌ VAZIO'}</p>
        {appUrl && <p style={{fontSize: '12px', color: '#666'}}>{appUrl}</p>}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc' }}>
        <h3>Teste de Conexão Supabase:</h3>
        <SupabaseTest />
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc' }}>
        <h3>Teste de Auth Context:</h3>
        <AuthTest />
      </div>
    </div>
  );
}

function SupabaseTest() {
  const [status, setStatus] = React.useState('Testando...');

  React.useEffect(() => {
    const test = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
          setStatus('❌ Variáveis não carregadas');
          return;
        }

        const client = createClient(url, key);
        const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });

        if (error) {
          setStatus(`❌ Erro: ${error.message}`);
        } else {
          setStatus('✅ Conexão OK');
        }
      } catch (e: any) {
        setStatus(`❌ Erro: ${e.message}`);
      }
    };

    test();
  }, []);

  return <p>{status}</p>;
}

function AuthTest() {
  const [status, setStatus] = React.useState('Carregando...');

  React.useEffect(() => {
    try {
      const { useAuth } = require('@/context/auth-context');
      const { user, isLoading } = useAuth();
      
      if (isLoading) {
        setStatus('Carregando contexto...');
      } else if (user) {
        setStatus(`✅ Usuário carregado: ${user.email}`);
      } else {
        setStatus('✅ Sem usuário (ok)');
      }
    } catch (e: any) {
      setStatus(`❌ Erro ao carregar auth context: ${e.message}`);
    }
  }, []);

  return <p>{status}</p>;
}

import React from 'react';
