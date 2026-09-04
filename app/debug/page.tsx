export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const annKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1>🔍 DEBUG PAGE</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff', border: '2px solid #ccc' }}>
        <h2>Environment Variables Check:</h2>
        
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong><br />
          {url ? `✅ CHARGÉ : ${url}` : '❌ VIDE'}
        </p>
        
        <p>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong><br />
          {annKey ? `✅ CHARGÉ (${annKey.length} chars)` : '❌ VIDE'}
        </p>
        
        <p>
          <strong>NEXT_PUBLIC_APP_URL:</strong><br />
          {appUrl ? `✅ CHARGÉ : ${appUrl}` : '❌ VIDE'}
        </p>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#ffffcc', border: '2px solid orange' }}>
        <h2>Status:</h2>
        {!url || !annKey ? (
          <p style={{color: 'red', fontSize: '18px'}}>
            ❌ Variables d'environnement NON chargées depuis .env.local
          </p>
        ) : (
          <p style={{color: 'green', fontSize: '18px'}}>
            ✅ Variables d'environnement chargées avec succès !
          </p>
        )}
      </div>
    </div>
  );
}
