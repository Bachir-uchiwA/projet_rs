import { contacts, archivedContacts, conversations } from './contacts.js';

// Variables globales
export let selectedDiffusionContacts = new Set();

export function updateDiffusionsList() {
    console.log('Updating diffusions list...');
    const container = document.getElementById('diffusions-list');
    if (!container) {
        console.error('Diffusions container not found');
        return;
    }

    const allContacts = [...contacts, ...archivedContacts];
    console.log('All contacts for diffusions:', allContacts.length);

    if (allContacts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">📢</div>
                    <p class="text-lg mb-2">Aucun contact disponible</p>
                    <p class="text-sm">Créez des contacts pour utiliser les diffusions</p>
                </div>
            </div>
        `;
        return;
    }

    const contactsHTML = allContacts.map(contact => {
        const isSelected = selectedDiffusionContacts.has(contact.id);
        const isArchived = archivedContacts.find(c => c.id === contact.id);
        
        return `
            <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}" 
                 onclick="toggleContactSelection(event, '${contact.id}')">
                <div class="relative">
                    <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                        ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                    </div>
                    <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-gray-300'} transition-colors">
                        ${isSelected ? 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>' : 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>'
                        }
                    </div>
                </div>
                <div class="w-[35vh] h-[8vh] flex-col flex ml-3">
                    <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                        ${contact.prenom} ${contact.nom}
                        ${isArchived ? '<span class="text-xs text-gray-500 ml-2">(Archivé)</span>' : ''}
                    </div>
                    <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                        ${contact.contact}
                    </div>
                </div>
                <div class="w-[15vh] h-[8vh] flex items-center justify-center">
                    ${isSelected ? 
                        `<button onclick="event.stopPropagation(); removeFromSelection('${contact.id}')" 
                                class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors">
                            Retirer
                        </button>` : 
                        `<button onclick="event.stopPropagation(); toggleContactSelection(event, '${contact.id}')" 
                                class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                            Sélectionner
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = contactsHTML;
    updateSelectionCounter();
    toggleMessageInputArea();
    console.log('✓ Diffusions list updated');
}

export function toggleContactSelection(event, contactId) {
    if (event) event.stopPropagation();
    
    console.log('Toggling contact selection:', contactId);
    
    if (selectedDiffusionContacts.has(contactId)) {
        selectedDiffusionContacts.delete(contactId);
    } else {
        selectedDiffusionContacts.add(contactId);
    }
    
    updateDiffusionsList();
    console.log('Selected contacts:', Array.from(selectedDiffusionContacts));
}

export function updateSelectionCounter() {
    const counter = document.getElementById('selection-counter');
    if (counter) {
        const count = selectedDiffusionContacts.size;
        if (count === 0) {
            counter.textContent = '';
        } else {
            counter.textContent = `${count} contact${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`;
        }
    }
}

export function toggleMessageInputArea() {
    const inputArea = document.getElementById('diffusions-message-input-area');
    const infoArea = document.getElementById('diffusion-info');
    const messageInput = document.getElementById('diffusionsMessageInput');
    const sendBtn = document.getElementById('diffusionsSendBtn');
    
    if (selectedDiffusionContacts.size > 0) {
        if (inputArea) {
            inputArea.classList.remove('hidden');
        }
        if (infoArea) {
            infoArea.innerHTML = `
                <div class="text-center text-gray-500 p-8">
                    <div class="text-6xl mb-4">📢</div>
                    <div class="text-lg mb-2">${selectedDiffusionContacts.size} contact${selectedDiffusionContacts.size > 1 ? 's' : ''} sélectionné${selectedDiffusionContacts.size > 1 ? 's' : ''}</div>
                    <div class="text-sm">Tapez votre message ci-dessous pour l'envoyer à tous</div>
                </div>
            `;
        }
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = `Tapez votre message pour ${selectedDiffusionContacts.size} contact${selectedDiffusionContacts.size > 1 ? 's' : ''}...`;
        }
        if (sendBtn) {
            sendBtn.disabled = false;
        }
    } else {
        if (inputArea) {
            inputArea.classList.add('hidden');
        }
        if (infoArea) {
            infoArea.innerHTML = `
                <div class="text-center text-gray-500 p-8">
                    <div class="text-6xl mb-4">📢</div>
                    <div class="text-lg mb-2">Diffusions</div>
                    <div class="text-sm">Sélectionnez des contacts pour envoyer un message groupé</div>
                </div>
            `;
        }
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Sélectionnez des contacts...';
            messageInput.value = '';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
        }
    }
}

function getSelectedContactsDisplay() {
    const allContacts = [...contacts, ...archivedContacts];
    const selectedContacts = Array.from(selectedDiffusionContacts)
        .map(id => allContacts.find(c => c.id === id))
        .filter(Boolean);
    
    return selectedContacts.map(contact => {
        const isArchived = archivedContacts.find(c => c.id === contact.id);
        return `
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                    ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm">
                    ${contact.prenom} ${contact.nom}
                    ${isArchived ? '<span class="text-gray-500">(Archivé)</span>' : ''}
                </span>
                <button onclick="window.removeFromSelection('${contact.id}')" 
                        class="text-red-500 hover:text-red-700 text-xs ml-auto">
                    ✕
                </button>
            </div>
        `;
    }).join('');
}

export function removeFromSelection(contactId) {
    console.log('Removing from selection:', contactId);
    selectedDiffusionContacts.delete(contactId);
    updateDiffusionsList();
}

export function clearSelection() {
    console.log('Clearing all selections');
    selectedDiffusionContacts.clear();
    updateDiffusionsList();
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage('Sélection effacée');
    }
}

export function selectAllContacts() {
    console.log('Selecting all contacts');
    const allContacts = [...contacts, ...archivedContacts];
    allContacts.forEach(contact => {
        selectedDiffusionContacts.add(contact.id);
    });
    updateDiffusionsList();
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage(`${allContacts.length} contacts sélectionnés`);
    }
}

export function sendDiffusionMessage() {
    const messageInput = document.getElementById('diffusionsMessageInput');
    if (!messageInput) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Veuillez saisir un message');
        }
        return;
    }
    
    if (selectedDiffusionContacts.size === 0) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Aucun contact sélectionné');
        }
        return;
    }
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const allContacts = [...contacts, ...archivedContacts];
    let sentCount = 0;
    
    // Envoyer le message à tous les contacts sélectionnés
    selectedDiffusionContacts.forEach(contactId => {
        const contact = allContacts.find(c => c.id === contactId);
        if (!contact) return;
        
        // Initialiser la conversation si nécessaire
        if (!conversations[contactId]) {
            conversations[contactId] = [];
        }
        
        // Ajouter le message de diffusion
        const diffusionMessage = {
            id: Date.now().toString() + '_' + contactId,
            text: messageText,
            type: 'sent',
            timestamp: timestamp,
            isDiffusion: true
        };
        
        conversations[contactId].push(diffusionMessage);
        
        // Mettre à jour le dernier message du contact
        contact.lastMessage = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        contact.timestamp = timestamp;
        
        sentCount++;
        
        // Simuler une réponse automatique après un délai aléatoire
        setTimeout(() => {
            simulateDiffusionResponse(contactId, contact);
        }, Math.random() * 5000 + 2000);
    });
    
    // Vider le champ de saisie
    messageInput.value = '';
    
    // Mettre à jour les listes
    try {
        if (window.updateContactsList) {
            window.updateContactsList();
        }
    } catch (error) {
        console.error('Error updating contacts list:', error);
    }
    
    // Afficher le message de succès
    if (window.showSuccessMessage) {
        window.showSuccessMessage(`Message envoyé à ${sentCount} contact${sentCount > 1 ? 's' : ''}`);
    }
    
    console.log(`Diffusion sent to ${sentCount} contacts`);
}

function simulateDiffusionResponse(contactId, contact) {
    const responses = [
        "Merci pour l'information !",
        "Bien reçu 👍",
        "OK, merci",
        "Parfait !",
        "Merci beaucoup",
        "C'est noté",
        "👌",
        "Merci pour le message",
        "Bien reçu, merci",
        "OK 👍"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    const responseMessage = {
        id: Date.now().toString() + '_response_' + contactId,
        text: randomResponse,
        type: 'received',
        timestamp: timestamp,
        isAutoResponse: true
    };
    
    if (!conversations[contactId]) {
        conversations[contactId] = [];
    }
    
    conversations[contactId].push(responseMessage);
    
    // Mettre à jour le dernier message
    contact.lastMessage = randomResponse.length > 30 ? randomResponse.substring(0, 30) + '...' : randomResponse;
    contact.timestamp = timestamp;
    
    // Mettre à jour les listes si nécessaire
    try {
        if (window.updateContactsList) {
            window.updateContactsList();
        }
    } catch (error) {
        console.error('Error updating contacts list after response:', error);
    }
}

export function filterDiffusions(searchTerm) {
    console.log('Filtering diffusions:', searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
        updateDiffusionsList();
        return;
    }
    
    const container = document.getElementById('diffusions-list');
    if (!container) return;
    
    const allContacts = [...contacts, ...archivedContacts];
    const filteredContacts = allContacts.filter(contact => {
        const fullName = `${contact.prenom} ${contact.nom}`.toLowerCase();
        const phone = contact.contact.toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || phone.includes(search);
    });
    
    if (filteredContacts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">🔍</div>
                    <p class="text-lg mb-2">Aucun résultat</p>
                    <p class="text-sm">Aucun contact ne correspond à votre recherche</p>
                </div>
            </div>
        `;
        return;
    }
    
    const contactsHTML = filteredContacts.map(contact => {
        const isSelected = selectedDiffusionContacts.has(contact.id);
        const isArchived = archivedContacts.find(c => c.id === contact.id);
        
        return `
            <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}" 
                 onclick="toggleContactSelection(event, '${contact.id}')">
                <div class="relative">
                    <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                        ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                    </div>
                    <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500' : 'bg-gray-300'} transition-colors">
                        ${isSelected ? 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg>' : 
                            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/></svg>'
                        }
                    </div>
                </div>
                <div class="w-[35vh] h-[8vh] flex-col flex ml-3">
                    <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                        ${contact.prenom} ${contact.nom}
                        ${isArchived ? '<span class="text-xs text-gray-500 ml-2">(Archivé)</span>' : ''}
                    </div>
                    <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                        ${contact.contact}
                    </div>
                </div>
                <div class="w-[15vh] h-[8vh] flex items-center justify-center">
                    ${isSelected ? 
                        `<button onclick="event.stopPropagation(); removeFromSelection('${contact.id}')" 
                                class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors">
                            Retirer
                        </button>` : 
                        `<button onclick="event.stopPropagation(); toggleContactSelection(event, '${contact.id}')" 
                                class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                            Sélectionner
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = contactsHTML;
    updateSelectionCounter();
}

export function initializeEventListeners() {
    console.log('Initializing diffusions event listeners...');
    
    // Barre de recherche
    const searchInput = document.getElementById('diffusionsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterDiffusions(e.target.value);
        });
        console.log('✓ Search input listener added');
    }
    
    // Envoi de message de diffusion
    const messageInput = document.getElementById('diffusionsMessageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendDiffusionMessage();
            }
        });
        console.log('✓ Diffusion message input listener added');
    }
    
    const sendBtn = document.getElementById('diffusionsSendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendDiffusionMessage);
        console.log('✓ Diffusion send button listener added');
    }
    
    console.log('✓ Diffusions event listeners initialized');
}

export function initializeApp() {
    console.log('Initializing diffusions app...');
    
    // Réinitialiser les sélections
    selectedDiffusionContacts.clear();
    
    console.log('✓ Diffusions app initialized');
}

// Exposer les fonctions pour le HTML
window.toggleContactSelection = toggleContactSelection;
window.filterDiffusions = filterDiffusions;
window.sendDiffusionMessage = sendDiffusionMessage;
window.removeFromSelection = removeFromSelection;
window.clearSelection = clearSelection;
window.selectAllContacts = selectAllContacts;