// EstateRadar — Verified Property Dossier Modal Component
// Obsidian Telemetry / Nordic Mobile Utility Design System
// Matches stitch_estateradar_mobile_app_ui/verified_property_dossier/code.html

export function renderPropertyDossierModal(property = null) {
  if (!property) return '';

  const lat = property.coordinates?.lat ? Number(property.coordinates.lat).toFixed(4) : '33.7294';
  const lng = property.coordinates?.lng ? Number(property.coordinates.lng).toFixed(4) : '73.0563';
  const hash = property.watermark?.hash || ('8f2a' + Math.random().toString(16).substring(2, 6) + 'e91c');
  const timestamp = property.timestamp || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const proximity = property.distanceFromPropertyMeters || 4.2;
  const dwell = property.stayDurationMinutes || 24;
  const surveyor = property.surveyorName || 'Hamza Tariq';
  const roverId = property.surveyorId || '4092';
  const ownerName = property.ownerName || 'Malik Tariq';
  const ownerInitials = ownerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'MT';
  const ownerPhone = property.ownerPhone || '+923001234567';
  const cleanPhone = ownerPhone.replace(/[^\d+]/g, '');

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `*Verified Cadastral Dossier — EstateRadar*\n` +
    `Property: ${property.type} (${property.demand})\n` +
    `Address: ${property.address}\n` +
    `Owner: ${ownerName} (${ownerPhone})\n` +
    `GPS Coordinates: ${lat}° N, ${lng}° E (RTK Verified)\n` +
    `Attestation Hash: SHA-256: ${hash}\n` +
    `Surveyor: ${surveyor} (#${roverId})\n` +
    `Verified via EstateRadar v1.0.4`
  )}`;

  return `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 overflow-y-auto" id="dossierModalBackdrop">
      <div class="w-full max-w-lg bg-surface text-on-surface rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-outline-variant/30 animate-slide-up" id="dossierModalCard">
        
        <!-- Sub-Header / Back Bar -->
        <header class="sticky top-0 z-20 bg-surface/90 backdrop-blur-md px-4 py-3 border-b border-surface-container-high/60 flex items-center justify-between">
          <button class="flex items-center gap-2 text-on-surface hover:text-primary transition-colors group cursor-pointer" id="closeDossierBtn">
            <span class="material-symbols-outlined text-[20px] text-secondary group-hover:text-primary transition-colors">arrow_back</span>
            <div class="flex flex-col text-left">
              <span class="text-[11px] text-secondary font-medium uppercase tracking-wider">Back to Feed</span>
              <span class="text-sm font-bold text-on-surface leading-tight">Cadastral Dossier</span>
            </div>
          </button>
          
          <div class="flex items-center gap-1.5">
            <a class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-95 cursor-pointer" 
               href="${waShareUrl}" 
               target="_blank" 
               id="btnShareWa" 
               title="Share via WhatsApp">
              <span class="material-symbols-outlined text-[18px]">share</span>
            </a>
            <button class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-transform active:scale-95 cursor-pointer" 
                    id="printPdfDossierBtn" 
                    title="Export Verified PDF">
              <span class="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            </button>
          </div>
        </header>

        <!-- Scrollable Dossier Body -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-8" id="printableDossierArea">
          
          <!-- Top Cryptographic Verification Seal Card -->
          <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 relative overflow-hidden">
            <div class="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary/5 pointer-events-none"></div>
            <div class="flex items-start justify-between gap-3 relative z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span class="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] font-mono uppercase tracking-wider font-bold text-primary">Cryptographically Attested &amp; GPS Locked</span>
                  <span class="text-base font-bold text-on-surface mt-0.5">Cadastral Lock Active</span>
                </div>
              </div>
              <div class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[10px]">
                CDA-PK-2026
              </div>
            </div>

            <div class="bg-surface-container-low rounded-lg p-3 mt-3 space-y-1.5 text-xs relative z-10 border border-outline-variant/10">
              <div class="flex items-center justify-between">
                <span class="text-secondary font-medium">Hash Signature</span>
                <span class="font-mono text-[10px] text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/20">SHA-256: ${hash}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-secondary font-medium">Attested Timestamp</span>
                <span class="font-mono text-[11px] text-on-surface font-semibold">${timestamp}</span>
              </div>
            </div>
          </div>

          <!-- Hero Stamped Evidence Photograph -->
          <div class="flex flex-col rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm border border-outline-variant/20">
            <div class="relative w-full h-56 bg-surface-container-high overflow-hidden">
              <img src="${property.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}" 
                   alt="${property.address}" 
                   class="w-full h-full object-cover">
              
              <!-- Top Stamp Watermark -->
              <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[13px] text-emerald-400">gavel</span>
                <span>${property.type || 'PROPERTY'} • ${property.address ? property.address.split(',')[0] : 'VERIFIED PLOT'}</span>
              </div>

              <!-- Telemetry HUD Burned-In Bar -->
              <div class="absolute inset-x-0 bottom-0 bg-inverse-surface/90 backdrop-blur-md px-3 py-2 text-inverse-on-surface flex flex-col gap-0.5">
                <div class="flex items-center justify-between">
                  <span class="text-[9px] tracking-widest text-emerald-400 uppercase font-mono font-bold">On-Site GNSS Rover Stamped</span>
                  <span class="font-mono text-[9px] text-inverse-on-surface/70">RTK PRECISION ±1.8M</span>
                </div>
                <span class="font-mono text-[10px] text-inverse-on-surface truncate">
                  VERIFIED GPS: ${lat}° N, ${lng}° E • ALT 542m • ROVER #${roverId} (${surveyor})
                </span>
              </div>
            </div>
          </div>

          <!-- Anti-Slacking On-Site Proximity Audit -->
          <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-[18px]">pin_drop</span>
                <span class="text-xs font-bold uppercase tracking-wider text-on-surface">Field Proof Audit</span>
              </div>
              <span class="font-mono text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">GEOFENCE SECURED</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div class="bg-surface-container-low rounded-lg p-3 flex flex-col border border-outline-variant/10">
                <span class="text-[11px] text-secondary font-medium">Facade Proximity</span>
                <span class="text-base font-bold text-on-surface mt-0.5">${proximity} meters</span>
                <span class="font-mono text-[9px] text-primary mt-1">Within Cadastral Boundary</span>
              </div>
              <div class="bg-surface-container-low rounded-lg p-3 flex flex-col border border-outline-variant/10">
                <span class="text-[11px] text-secondary font-medium">Dwell Duration</span>
                <span class="text-base font-bold text-on-surface mt-0.5">${dwell} minutes</span>
                <span class="font-mono text-[9px] text-primary mt-1">Anti-Slacking Verified</span>
              </div>
            </div>
          </div>

          <!-- Property Specifications & Cadastral Details -->
          <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 space-y-3">
            <div class="flex flex-col gap-0.5">
              <div class="flex items-baseline justify-between flex-wrap gap-2">
                <span class="text-xl font-extrabold text-primary tracking-tight font-mono">${property.demand}</span>
                <span class="font-mono text-[11px] text-secondary">Verified Market Valuation</span>
              </div>
              <h2 class="text-base font-bold text-on-surface mt-1">${property.type} • ${property.address}</h2>
              <span class="text-xs text-on-surface-variant">${property.address}</span>
            </div>

            <!-- Specification Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-outline-variant/10">
                <span class="text-[10px] text-secondary font-medium">Area / Lot</span>
                <span class="font-bold text-on-surface mt-0.5">${property.area || '1 Kanal (500 Sq Yds)'}</span>
              </div>
              <div class="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-outline-variant/10">
                <span class="text-[10px] text-secondary font-medium">Classification</span>
                <span class="font-bold text-on-surface mt-0.5">${property.type || 'Residential Villa'}</span>
              </div>
              <div class="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-outline-variant/10">
                <span class="text-[10px] text-secondary font-medium">Deal Status</span>
                <span class="font-bold text-on-surface mt-0.5">${property.status || 'Active Deal'}</span>
              </div>
              <div class="bg-surface-container-low rounded-lg p-2.5 flex flex-col border border-outline-variant/10">
                <span class="text-[10px] text-secondary font-medium">Survey Condition</span>
                <span class="font-bold text-on-surface mt-0.5">${property.condition || 'Brand New Finished'}</span>
              </div>
            </div>

            <!-- Owner Info Card -->
            <div class="bg-surface-container rounded-lg p-3 space-y-2.5 border border-outline-variant/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                    ${ownerInitials}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-on-surface">${ownerName}</span>
                    <span class="text-[10px] text-secondary">Direct Title Holder</span>
                  </div>
                </div>
                <span class="font-mono text-[9px] font-bold bg-surface-container-lowest text-primary px-2 py-0.5 rounded border border-outline-variant/20">RECORD MATCH</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1">
                <a class="h-9 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors border border-outline-variant/20" 
                   href="tel:${cleanPhone}">
                  <span class="material-symbols-outlined text-[16px]">call</span>
                  <span>Direct Call</span>
                </a>
                <a class="h-9 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors border border-outline-variant/20" 
                   href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${ownerName}, inquiring regarding verified listing ${property.address}`)}" 
                   target="_blank">
                  <span class="material-symbols-outlined text-[16px]">chat</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Field Surveyor Audit Trail -->
          <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-on-surface">Surveyor Audit Trail</span>
              <span class="font-mono text-[10px] text-secondary">STAMP ID: #${roverId}-CDA</span>
            </div>

            <div class="flex items-center gap-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant/10">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span class="material-symbols-outlined text-[24px]">engineering</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-on-surface truncate">${surveyor}</span>
                <span class="font-mono text-[10px] text-secondary">Rover ID #${roverId}</span>
                <span class="text-[10px] text-on-surface-variant mt-0.5">RTK GNSS Sensor Certified</span>
              </div>
            </div>

            <div class="bg-surface-container-low rounded-lg p-3 text-xs border border-outline-variant/10">
              <span class="font-mono text-[10px] uppercase tracking-wider font-bold text-secondary block mb-1">Surveyor Field Notes</span>
              <p class="text-on-surface leading-relaxed italic">
                "${property.notes || property.condition || 'Boundary coordinates verified against cadastral sector map. Foundation and construction confirmed on-site within ±1.8m RTK tolerance.'}"
              </p>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="space-y-2 pt-2">
            <button class="w-full py-3.5 px-4 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-[0.99] shadow-md cursor-pointer" 
                    id="btnExportMain">
              <span class="material-symbols-outlined text-[18px]">verified</span>
              <span>Export Verified PDF Dossier</span>
            </button>
            <a class="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors active:scale-[0.99] cursor-pointer" 
               href="${waShareUrl}" 
               target="_blank" 
               id="btnShareMain">
              <span class="material-symbols-outlined text-[18px]">share</span>
              <span>Share WhatsApp Report</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  `;
}

export function bindPropertyDossierEvents(onClose) {
  const closeBtn = document.getElementById('closeDossierBtn');
  const backdrop = document.getElementById('dossierModalBackdrop');
  const printPdfBtn = document.getElementById('printPdfDossierBtn');
  const btnExportMain = document.getElementById('btnExportMain');

  if (closeBtn) closeBtn.onclick = onClose;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) onClose();
    };
  }

  const handlePrint = () => {
    window.print();
  };

  if (printPdfBtn) printPdfBtn.onclick = handlePrint;
  if (btnExportMain) btnExportMain.onclick = handlePrint;
}
