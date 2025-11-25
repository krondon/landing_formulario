// Claves públicas de Supabase (anon). Asegúrate de tener RLS/policies apropiadas.
const SUPABASE_URL = 'https://sdiogjzzkbnhteqtvvfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkaW9nanp6a2JuaHRlcXR2dmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NjAwNDEsImV4cCI6MjA3OTMzNjA0MX0.e1FaziWHzAVXLlIYxoUZlolFPYS9g9McghgmNz9-Bzs';

// Inicializar cliente
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('leadForm');
const msgEl = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgEl.textContent = '';
  msgEl.className = 'msg';

  const formData = new FormData(form);
  const data = {
    email: formData.get('email').trim().toLowerCase(),
    nombre_apellido: formData.get('nombre_apellido').trim(),
    cedula: formData.get('cedula').trim(),
    telefono: formData.get('telefono').trim(),
    zona: formData.get('zona')
  };

  // Validaciones
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
    msgEl.textContent = 'Email inválido.';
    msgEl.classList.add('error');
    return;
  }

  form.querySelector('button').disabled = true;
  form.querySelector('button').textContent = 'Enviando...';

  try {
    const { error } = await sb.from('leads_chacao').insert(data);
    if (error) throw error;
    msgEl.textContent = '¡Datos enviados correctamente!';
    msgEl.classList.add('success');
    form.reset();
    setTimeout(() => { window.location.href = 'revista/index.html'; }, 1000);
  } catch (err) {
    console.error(err);
    msgEl.textContent = 'Error al guardar. Intenta de nuevo.';
    msgEl.classList.add('error');
  } finally {
    form.querySelector('button').disabled = false;
    form.querySelector('button').textContent = 'Enviar';
  }
});

// Bloquear pegado no numérico en cédula y teléfono
['cedula','telefono'].forEach(n=>{
  const el = document.querySelector(`[name="${n}"]`);
  el?.addEventListener('paste', (e)=>{
    const txt = (e.clipboardData || window.clipboardData).getData('text');
    if(/\D/.test(txt)) e.preventDefault();
  });
});

// Sorteo inline removido; usar game.html para sorteo.

// --- Admin secret modal download ---
const logoEl = document.querySelector('footer img');
let tapCount = 0; let tapTimer;
const modal = document.getElementById('adminModal');
const adminPassInput = document.getElementById('adminPass');
const adminMsg = document.getElementById('adminMsg');
const confirmBtn = document.getElementById('confirmModal');
const cancelBtn = document.getElementById('cancelModal');

function resetTaps(){ tapCount = 0; clearTimeout(tapTimer); }

logoEl?.addEventListener('click', ()=>{
  tapCount++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(resetTaps, 1500); // 1.5s window
  if(tapCount >= 5){
    resetTaps();
    adminPassInput.value='';
    adminMsg.textContent='';
    modal.style.display='flex';
    adminPassInput.focus();
  }
});

cancelBtn?.addEventListener('click', ()=>{ modal.style.display='none'; });

confirmBtn?.addEventListener('click', async ()=>{
  adminMsg.textContent='';
  const pass = adminPassInput.value.trim();
  if(pass !== 'Nhy6bgt5..'){
    adminMsg.textContent='Contraseña incorrecta';
    adminMsg.style.color='#ef4444';
    return;
  }
  confirmBtn.disabled = true; confirmBtn.textContent='Generando...';
  try {
    const { data, error } = await sb.from('leads_chacao').select('*').order('created_at',{ascending:false});
    if(error) throw error;
    // Build XLSX workbook
    const header = ['email','nombre_apellido','cedula','telefono','zona','created_at'];
    const aoa = [header].concat(data.map(r=>[r.email,r.nombre_apellido,r.cedula,r.telefono,r.zona,r.created_at]));
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    try {
      if(typeof XLSX !== 'undefined') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(wb, ws, 'leads');
        XLSX.writeFile(wb, `leads_chacao_${ts}.xlsx`);
      } else {
        // Fallback to CSV if library missing
        const csv = aoa.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `leads_chacao_${ts}.csv`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }
      modal.style.display='none';
    } catch(genErr){ console.error(genErr); adminMsg.textContent='Error generando Excel'; adminMsg.style.color='#ef4444'; }

  } catch(err){
    console.error(err);
    adminMsg.textContent='Error al descargar';
    adminMsg.style.color='#ef4444';
  } finally {
    confirmBtn.disabled = false; confirmBtn.textContent='Descargar';
  }
});


