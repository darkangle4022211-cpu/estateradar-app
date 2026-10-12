// Verified Property Dossier & PDF Export Modal Component

export function renderPropertyDossierModal(property = null) {
  if (!property) return '';

  return `
    <div class="dossier-modal-backdrop" id="dossierModalBackdrop">
      <div class="dossier-modal-sheet animate-slide-up">
        <!-- Header -->
        <div class="dossier-header">
          <div class="dossier-title-box">
            <span class="verified-seal-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>GPS Cryptographically Verified</span>
            </span>
            <h3>${property.type} — ${property.demand}</h3>
            <p class="dossier-address">${property.address}</p>
          </div>
          <button class="dossier-close-btn" id="closeDossierBtn">✕</button>
        </div>

        <div class="dossier-body-scroll" id="printableDossierArea">
          <!-- Main Photo with Watermark Seal -->
          <div class="dossier-image-frame">
            <img src="${property.imageUrl}" alt="${property.address}" class="dossier-main-img" />
            <div class="dossier-watermark-stamp">
              <div class="stamp-header">ESTATERADAR AUDIT VERIFIED</div>
              <div class="stamp-meta">TIMESTAMP: ${property.timestamp}</div>
              <div class="stamp-meta">COORDINATES: ${property.coordinates.lat.toFixed(5)}° N, ${property.coordinates.lng.toFixed(5)}° E</div>
              <div class="stamp-meta">SURVEYOR: ${property.surveyorName} (${property.surveyorId})</div>
              <div class="stamp-meta">SECURITY HASH: ${property.watermark.hash}</div>
            </div>
          </div>

          <!-- Anti-Slacking Verification Stats -->
          <div class="audit-verification-banner">
            <div class="audit-metric">
              <span class="audit-icon">📍</span>
              <div class="audit-text">
                <strong>Facade Proximity Verified</strong>
                <span>Surveyor was within <strong>${property.distanceFromPropertyMeters} meters</strong> of the property.</span>
              </div>
            </div>
            <div class="audit-metric">
              <span class="audit-icon">⏱️</span>
              <div class="audit-text">
                <strong>On-Site Survey Duration</strong>
                <span>Surveyor physically stayed on-site for <strong>${property.stayDurationMinutes} minutes</strong>.</span>
              </div>
            </div>
          </div>

          <!-- Property Specification Table -->
          <div class="spec-table-grid">
            <div class="spec-item">
              <span class="spec-label">Property Type</span>
              <span class="spec-value">${property.type}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Area / Dimensions</span>
              <span class="spec-value">${property.area}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Demand / Asking Price</span>
              <span class="spec-value price-highlight">${property.demand}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Deal Status</span>
              <span class="spec-value">${property.status}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Owner / Broker</span>
              <span class="spec-value">${property.ownerName}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Contact Number</span>
              <span class="spec-value font-mono">${property.ownerPhone}</span>
            </div>
          </div>

          <!-- Notes -->
          <div class="dossier-notes-box">
            <h5>Surveyor Condition Notes:</h5>
            <p>"${property.condition}"</p>
          </div>
        </div>

        <!-- Action Bar: Export PDF & WhatsApp Share -->
        <div class="dossier-footer-actions">
          <button class="dossier-btn pdf" id="printPdfDossierBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Export Verified PDF Dossier</span>
          </button>

          <a href="https://wa.me/?text=Verified%20Property%20from%20EstateRadar%3A%0AAddress%3A%20${encodeURIComponent(property.address)}%0AType%3A%20${encodeURIComponent(property.type)}%0ADemand%3A%20${encodeURIComponent(property.demand)}%0AOwner%3A%20${encodeURIComponent(property.ownerName)}%20(${encodeURIComponent(property.ownerPhone)})%0AGPS%20Verified%20at%20${property.timestamp}" 
             target="_blank" 
             class="dossier-btn whatsapp">
            <span>💬 Share via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

export function bindPropertyDossierEvents(onClose) {
  const closeBtn = document.getElementById('closeDossierBtn');
  const backdrop = document.getElementById('dossierModalBackdrop');
  const printPdfBtn = document.getElementById('printPdfDossierBtn');

  if (closeBtn) closeBtn.onclick = onClose;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) onClose();
    };
  }

  if (printPdfBtn) {
    printPdfBtn.onclick = () => {
      window.print();
    };
  }
}
