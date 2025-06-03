import * as diffusionsModule from './diffusions.js';

// Variables globales
export let contacts = [];
export let archivedContacts = [];
export let conversations = {};
export let currentContact = null;
export let currentArchivedContact = null; // Ajout de cette variable
let hasSubmitAttempt = false;
let firstSubmitSuccess = false;
let isTyping = false;
let messageStatuses = new Map(); // Pour suivre le statut des messages

export function updateContactsList() {
    console.log('Updating contacts list...');
    const container = document.getElementById('contacts-container');
    if (!container) {
        console.error('Contacts container not found');
        return;
    }

    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">👥</div>
                    <p class="text-lg mb-2">Aucun contact disponible</p>
                    <p class="text-sm">Créez votre premier contact dans la section "Nouveau"</p>
                </div>
            </div>
        `;
        return;
    }

    const contactsHTML = contacts.map(contact => `
        <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-100" 
             onclick="selectContact('${contact.id}')">
            <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
            </div>
            <div class="w-[35vh] h-[8vh] flex-col flex ml-3">
                <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                    ${contact.prenom} ${contact.nom}
                </div>
                <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                    ${contact.lastMessage || 'Aucun message'}
                </div>
            </div>
            <div class="w-[15vh] h-[8vh] flex flex-col items-center justify-center">
                <div class="flex items-center gap-1">
                    <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" 
                         class="${contact.lastMessageRead ? 'text-blue-500' : 'text-gray-500'}" 
                         fill="none">
                        <path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832Z" 
                            fill="currentColor">
                        </path>
                    </svg>
                    <span class="text-xs text-green-500">
                        ${contact.timestamp || ''}
                    </span>
                </div>
                <!-- Cercle vert -->
                <div class="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
            </div>
        </div>
    `).join('');

    container.innerHTML = contactsHTML;
    console.log('Contacts list updated with', contacts.length, 'contacts');
}

export function selectContact(contactId) {
    console.log('Selecting contact:', contactId);
    
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) {
        console.error('Contact not found:', contactId);
        return;
    }
    
    currentContact = contact;
    console.log('Current contact set to:', contact);
    
    // Mettre à jour l'en-tête du chat
    updateChatHeader(contact);
    
    // Charger les messages de la conversation
    loadConversation(contactId);
    
    // Activer la zone de saisie
    enableMessageInput(contact);
}

function updateChatHeader(contact) {
    const chatHeader = document.querySelector('#messages-section .h-\\[60px\\]');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <div class="w-10 h-10 bg-[#747477] rounded-full mr-3 flex items-center justify-center text-white font-bold">
                ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
                <div class="font-semibold text-lg">${contact.prenom} ${contact.nom}</div>
            </div>
            <div class="flex gap-2">
                <!-- Icône vidéo -->
                <div class="w-8 h-8 border border-orange-500 rounded-full flex items-center justify-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" viewBox="0 0 16 16">
                        <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.6.8L14 7.5a2.5 2.5 0 0 1 0 1L11.1 12.2a2 2 0 0 1-1.6.8H2a2 2 0 0 1-2-2V5Z"/>
                    </svg>
                </div>
                <!-- Icône archive -->
                <div class="w-8 h-8 border border-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                     onclick="archiveCurrentDiscussion(event, '${contact.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive text-gray-800" viewBox="0 0 16 16">
                        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5zm13-3H1v2h14zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
                    </svg>
                </div>
                <!-- Icône recherche -->
                <div class="w-8 h-8 border border-black rounded-full flex items-center justify-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square-fill" viewBox="0 0 16 16">
                        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>
                    </svg>
                </div>
                <!-- Supprimer messages -->
                <div class="w-8 h-8 border border-red-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-colors"
                     onclick="clearConversation()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                    </svg>
                </div>
            </div>
        `;
    }
}

function enableMessageInput(contact) {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = `Tapez votre message à ${contact.prenom}...`;
    }
    
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('bg-gray-400');
        sendBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
}

export function loadConversation(contactId) {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    // Initialiser la conversation si elle n'existe pas
    if (!conversations[contactId]) {
        conversations[contactId] = [];
    }
    
    const messages = conversations[contactId];
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="text-6xl mb-4">💬</div>
                    <div class="text-lg mb-2">Commencez la conversation</div>
                    <div class="text-sm">Envoyez votre premier message</div>
                </div>
            </div>
        `;
        return;
    }
    
    const messagesHTML = messages.map(message => {
        if (message.type === 'sent') {
            return `
                <div class="flex justify-end mb-4 message-item">
                    <div class="max-w-xs bg-green-500 text-white rounded-2xl px-4 py-2 shadow-sm">
                        <div class="text-sm">${escapeHtml(message.text)}</div>
                        <div class="flex items-center justify-end gap-1 mt-1">
                            <span class="text-xs text-green-100">${message.timestamp}</span>
                            <!-- Indicateurs de statut -->
                            <span class="message-status">
                                ${message.status === 'sent' ? '✓' : ''}
                                ${message.status === 'delivered' ? '✓✓' : ''}
                                ${message.status === 'read' ? '✓✓' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex mb-4 message-item">
                    <div class="max-w-xs bg-white rounded-2xl px-4 py-2 shadow-sm">
                        ${message.isAutoResponse ? '<div class="text-xs text-gray-400 mb-1 response-badge px-2 py-1 rounded text-white">🤖 Réponse auto</div>' : ''}
                        <div class="text-sm">${escapeHtml(message.text)}</div>
                        <div class="text-xs text-gray-500 mt-1">${message.timestamp}</div>
                    </div>
                </div>
            `;
        }
    }).join('');
    
    messagesContainer.innerHTML = messagesHTML;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input?.value.trim();

    // Vérifier si un contact est sélectionné
    if (!currentContact) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Veuillez sélectionner un contact avant d\'envoyer un message');
        }
        return;
    }

    // Vérifier si le message n'est pas vide
    if (!text) {
        return;
    }

    // Reste du code pour l'envoi du message...
    const messageId = Date.now().toString();
    const message = {
        id: messageId,
        type: 'sent',
        text: text,
        timestamp: new Date().toLocaleTimeString(),
        status: 'sent'
    };

    // Ajouter le message à la conversation
    if (!conversations[currentContact.id]) {
        conversations[currentContact.id] = [];
    }
    conversations[currentContact.id].push(message);

    // Mettre à jour le dernier message du contact
    currentContact.lastMessage = text;

    // Masquer le message d'accueil si présent
    const welcomeMessage = document.querySelector('#messages-container .text-center');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Afficher le message et mettre à jour la liste des contacts
    displayMessage(message);
    updateContactsList();
    input.value = '';

    // Simuler la réception immédiate (double check)
    setTimeout(() => {
        message.status = 'delivered';
        updateMessageStatus(messageId, 'delivered');
    }, 1000);

    // Simuler la lecture du message
    setTimeout(() => {
        currentContact.lastMessageRead = true;
        message.status = 'read';
        updateMessageStatus(messageId, 'read');
        updateContactsList();
    }, 3000);
}

function updateMessageStatus(messageId, status) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement) {
            // Mettre à jour l'icône de statut
            statusElement.innerHTML = getStatusIcon(status);
        }
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'sent':
            return '✓';
        case 'delivered':
            return '✓✓';
        case 'read':
            return '<span class="text-blue-500">✓✓</span>';
        default:
            return '';
    }
}

function displayMessage(message) {
    const container = document.getElementById('messages-container');
    const messageHTML = `
        <div class="flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'} mb-4" 
             data-message-id="${message.id}">
            <div class="max-w-xs ${message.type === 'sent' ? 'bg-green-500 text-white' : 'bg-white'} rounded-2xl px-4 py-2 shadow-sm">
                <div class="text-sm">${escapeHtml(message.text)}</div>
                <div class="flex items-center ${message.type === 'sent' ? 'justify-end' : 'justify-start'} gap-1 mt-1">
                    <span class="text-xs ${message.type === 'sent' ? 'text-green-100' : 'text-gray-500'}">${message.timestamp}</span>
                    ${message.type === 'sent' ? `<span class="message-status">${getStatusIcon(message.status)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', messageHTML);
    container.scrollTop = container.scrollHeight;
}

export function clearConversation() {
    if (currentContact) {
        // Afficher le modal de confirmation
        const modalHTML = `
            <div id="deleteMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg w-[500px] p-6 shadow-xl">
                    <h2 class="text-2xl font-bold mb-4">Supprimer la conversation</h2>
                    <p class="text-gray-600 mb-6">Voulez-vous vraiment supprimer tous les messages de cette conversation avec ${currentContact.prenom} ${currentContact.nom} ?</p>
                    
                    <div class="flex gap-3 pt-4">
                        <button id="cancelDeleteBtn" 
                                class="flex-1 px-6 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition-colors duration-200 font-medium">
                            Annuler
                        </button>
                        <button id="confirmDeleteBtn"
                                class="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-medium">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Récupérer les références des boutons
        const modal = document.getElementById('deleteMessageModal');
        const cancelBtn = document.getElementById('cancelDeleteBtn');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        // Gestionnaire pour le bouton Annuler
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        // Gestionnaire pour le bouton Confirmer
        confirmBtn.addEventListener('click', () => {
            // Vider la conversation
            conversations[currentContact.id] = [];
            
            // Réinitialiser l'affichage
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                            <div class="text-6xl mb-4">💬</div>
                            <div class="text-lg mb-2">Commencez la conversation</div>
                            <div class="text-sm">Envoyez votre premier message</div>
                        </div>
                    </div>
                `;
            }
            
            // Mise à jour de l'interface
            currentContact.lastMessage = '';
            updateContactsList();

            // Fermer le modal
            modal.remove();

            // Afficher le message de succès
            if (window.showSuccessMessage) {
                window.showSuccessMessage('Conversation supprimée avec succès');
            }
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function clearError(fieldId) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.classList.add('hidden');
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('border-red-500');
        }
    }
}

export function showError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    const input = document.getElementById(fieldId);
    
    // Afficher l'erreur seulement si on tape après un premier succès
    if (firstSubmitSuccess && isTyping) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
        if (input) {
            input.classList.add('border-red-500');
        }
    }
}

export function validatePhoneNumber(phone) {
    return /^\d{3,}$/.test(phone);
}

export function clearForm() {
    hasSubmitAttempt = false;
    ['prenom', 'nom', 'contact'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = '';
            input.classList.remove('border-red-500');
        }
        clearError(fieldId);
    });
}

export function submitForm(e) {
    if (e) e.preventDefault();

    const prenom = document.getElementById('prenom')?.value.trim() || '';
    const nom = document.getElementById('nom')?.value.trim() || '';
    const contact = document.getElementById('contact')?.value.trim() || '';

    let isValid = true;
    ['prenom', 'nom', 'contact'].forEach(fieldId => clearError(fieldId));

    // Validation toujours effectuée
    if (prenom === '') {
        showError('prenom', 'Le prénom est obligatoire');
        isValid = false;
    } else if (prenom.length < 2) {
        showError('prenom', 'Le prénom doit contenir au moins 2 caractères');
        isValid = false;
    }

    if (nom === '') {
        showError('nom', 'Le nom est obligatoire');
        isValid = false;
    } else if (nom.length < 2) {
        showError('nom', 'Le nom doit contenir au moins 2 caractères');
        isValid = false;
    }

    if (contact === '') {
        showError('contact', 'Le numéro de téléphone est obligatoire');
        isValid = false;
    } else if (!validatePhoneNumber(contact)) {
        showError('contact', 'Le numéro doit contenir au moins 3 chiffres');
        isValid = false;
    }

    if (!isValid) return;

    // Si on arrive ici, le formulaire est valide
    firstSubmitSuccess = true;
    isTyping = false;
    
    // Vérifier les doublons et ajouter un numéro si nécessaire
    let fullName = `${prenom} ${nom}`;
    let counter = 1;
    let finalFullName = fullName;

    while (contacts.some(c => 
        `${c.prenom} ${c.nom}`.toLowerCase() === finalFullName.toLowerCase()
    )) {
        finalFullName = `${fullName}(${counter})`;
        counter++;
    }

    // Séparer le prénom et le nom final
    const nameParts = finalFullName.split(' ');
    const finalNom = nameParts.pop(); // Prend le dernier élément
    const finalPrenom = nameParts.join(' '); // Joint le reste

    // Créer le contact
    const newContact = {
        id: Date.now().toString(),
        prenom: finalPrenom,
        nom: finalNom,
        contact,
        timestamp: new Date().toLocaleDateString('fr-FR'),
        lastMessage: ''
    };

    contacts.push(newContact);
    updateContactsList();
    
    // Mettre à jour les diffusions
    try {
        if (diffusionsModule.updateDiffusionsList) {
            diffusionsModule.updateDiffusionsList();
        }
    } catch (error) {
        console.error('Error updating diffusions:', error);
    }

    clearForm();
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage(`Contact ${finalPrenom} ${finalNom} ajouté avec succès !`);
    }
}

export function archiveCurrentDiscussion(event, contactId) {
    if (event) event.stopPropagation();
    
    const idx = contacts.findIndex(c => c.id === contactId);
    if (idx === -1) return;
    
    const contact = contacts[idx];
    contacts.splice(idx, 1);
    
    archivedContacts.push({
        ...contact,
        archivedDate: new Date().toLocaleDateString('fr-FR')
    });
    
    // Si c'était le contact actuel, le désélectionner
    if (currentContact && currentContact.id === contactId) {
        currentContact = null;
        resetChatInterface();
    }
    
    updateContactsList();
    updateArchivedContactsList();
    
    try {
        if (diffusionsModule.updateDiffusionsList) {
            diffusionsModule.updateDiffusionsList();
        }
    } catch (error) {
        console.error('Error updating diffusions:', error);
    }
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage('Contact archivé avec succès');
    }
}

function resetChatInterface() {
    // Réinitialiser l'en-tête du chat
    const chatHeader = document.querySelector('#messages-section .h-\\[60px\\]');
    if (chatHeader) {
        const avatar = chatHeader.querySelector('.rounded-full');
        const nameDiv = chatHeader.querySelector('.font-semibold');
        
        if (avatar) {
            avatar.textContent = '';
            avatar.classList.add('bg-gray-500');
            avatar.classList.remove('bg-[#747477]');
        }
        
        if (nameDiv) {
            nameDiv.textContent = 'Sélectionnez un contact';
        }
    }
    
    // Réinitialiser la zone des messages
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                Sélectionnez une conversation pour voir les messages
            </div>
        `;
    }
    
    // Désactiver la zone de saisie
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = 'Sélectionnez un contact pour commencer...';
        messageInput.value = '';
    }
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add('bg-gray-400');
        sendBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
    }
}

export function updateArchivedContactsList() {
    const container = document.getElementById('archives-container');
    if (!container) return;

    container.innerHTML = `
        <div class="w-full h-full flex">
            <!-- Liste des contacts archivés -->
            <div class="w-[44.4%] h-full bg-[#F9F7F5] flex flex-col">
                <div class="h-[5vh] px-[20px] py-[10px] text-[25px]">
                    <label>Archives</label>
                </div>
                <div class="px-[20px] mb-2">
                    <input type="text" class="h-[30px] w-full border rounded px-4" placeholder="Rechercher dans les archives" disabled>
                </div>
                <div class="flex-1 overflow-y-auto" id="archived-list">
                    ${
                        archivedContacts.length === 0
                        ? `<div class="flex items-center justify-center h-40">
                                <div class="text-center text-gray-500">
                                    <div class="text-6xl mb-4">📁</div>
                                    <p class="text-lg mb-2">Aucune discussion archivée</p>
                                    <p class="text-sm">Les conversations archivées apparaîtront ici</p>
                                </div>
                           </div>`
                        : archivedContacts.map(contact => `
                            <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-100"
                                 onclick="selectArchivedContact('${contact.id}')">
                                <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                                    ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                                </div>
                                <div class="w-[35vh] h-[8vh] flex-col flex ml-3">
                                    <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                                        ${contact.prenom} ${contact.nom}
                                    </div>
                                    <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                                        Archivé le ${contact.archivedDate || ''}
                                    </div>
                                </div>
                                <div class="w-[15vh] h-[8vh] flex items-center justify-center">
                                    <button onclick="event.stopPropagation();unarchiveContact('${contact.id}')" 
                                            class="px-3 py-1 bg-[#DEB449] text-white rounded-lg hover:bg-[#C69F41] transition-colors text-sm">
                                        Désarchiver
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
            <!-- Zone de chat des archives -->
            <div class="w-[55.6%] h-full bg-[#E8E3D3] flex flex-col">
                <div class="h-[60px] bg-[#F0EFE8] flex items-center px-4 border-b border-gray-300">
                    <div class="w-10 h-10 bg-gray-500 rounded-full mr-3 flex items-center justify-center text-white font-bold" id="archive-avatar"></div>
                    <div class="flex-1">
                        <div class="font-semibold text-lg" id="archive-name">Sélectionnez une archive</div>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-8 h-8 border border-orange-500 rounded-full flex items-center justify-center cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="orange" viewBox="0 0 16 16">
                                <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.6.8L14 7.5a2.5 2.5 0 0 1 0 1L11.1 12.2a2 2 0 0 1-1.6.8H2a2 2 0 0 1-2-2V5Z"/>
                        </div>
                        <div class="w-8 h-8 border border-black rounded-full flex items-center justify-center cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square-fill" viewBox="0 0 16 16">
                                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z"/>
                            </svg>
                        </div>
                        <div class="w-8 h-8 border border-red-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-colors"
                             onclick="clearArchivedConversation()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="red" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="flex-1 p-4 overflow-y-auto" id="archived-messages-container">
                    <div class="flex items-center justify-center h-full text-gray-500">
                        <div class="text-center">
                            <div class="text-6xl mb-4">📁</div>
                            <div class="text-lg mb-2">Sélectionnez une discussion archivée</div>
                            <div class="text-sm">Les messages archivés apparaîtront ici</div>
                        </div>
                    </div>
                </div>
                <div class="h-[60px] bg-[#F0EFE8] flex items-center px-4 gap-3">
                    <input 
                        type="text"
                        id="archivedMessageInput"
                        placeholder="Tapez votre message..."
                        class="flex-1 bg-white rounded-full px-4 py-2 border border-gray-300"
                    >
                    <button 
                        id="archivedSendBtn"
                        class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                        onclick="sendArchivedMessage()"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="20" fill="currentColor" class="bi bi-arrow-right text-white font-bold" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function unarchiveContact(contactId) {
    const idx = archivedContacts.findIndex(c => c.id === contactId);
    if (idx === -1) return;
    
    const contact = archivedContacts[idx];
    archivedContacts.splice(idx, 1);
    
    // Supprimer la date d'archivage
    delete contact.archivedDate;
    
    contacts.push(contact);
    updateContactsList();
    updateArchivedContactsList();
    
    try {
        if (diffusionsModule.updateDiffusionsList) {
            diffusionsModule.updateDiffusionsList();
        }
    } catch (error) {
        console.error('Error updating diffusions:', error);
    }
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage('Contact désarchivé avec succès');
    }
}

function updateArchivedChatInterface() {
    const messageInput = document.getElementById('archivedMessageInput');
    const sendBtn = document.getElementById('archivedSendBtn');
    
    if (!currentArchivedContact) {
        // Désactiver l'interface quand aucun contact n'est sélectionné
        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = 'Sélectionnez une discussion archivée...';
        }
        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.classList.add('bg-gray-400');
            sendBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        }
    } else {
        // Activer l'interface quand un contact est sélectionné
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.placeholder = 'Tapez votre message...';
        }
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.classList.remove('bg-gray-400');
            sendBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        }
    }
}

// Modifier la fonction selectArchivedContact
export function selectArchivedContact(contactId) {
    currentArchivedContact = contactId;
    const contact = archivedContacts.find(c => c.id === contactId);
    if (!contact) return;
    
    // Mettre à jour l'en-tête des archives
    const archiveAvatar = document.getElementById('archive-avatar');
    const archiveName = document.getElementById('archive-name');
    const unarchiveBtn = document.getElementById('unarchiveBtn');
    
    if (archiveAvatar) {
        archiveAvatar.textContent = contact.prenom.charAt(0).toUpperCase() + contact.nom.charAt(0).toUpperCase();
    }
    
    if (archiveName) {
        archiveName.textContent = `${contact.prenom} ${contact.nom}`;
    }
    
    if (unarchiveBtn) {
        unarchiveBtn.classList.remove('hidden');
        unarchiveBtn.onclick = () => unarchiveContact(contactId);
    }
    
    // Afficher les messages archivés
    const messagesContainer = document.getElementById('archived-messages-container');
    if (messagesContainer && conversations[contactId]) {
        const messages = conversations[contactId];
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="flex items-center justify-center h-full text-gray-500">
                    <div class="text-center">
                        <div class="text-6xl mb-4">💬</div>
                        <div class="text-lg mb-2">Aucun message</div>
                        <div class="text-sm">Cette conversation n'a pas de messages</div>
                    </div>
                </div>
            `;
        } else {
            const messagesHTML = messages.map(message => {
                if (message.type === 'sent') {
                    return `
                        <div class="flex justify-end mb-4">
                            <div class="max-w-xs bg-green-500 text-white rounded-2xl px-4 py-2 shadow-sm">
                                <div class="text-sm">${escapeHtml(message.text)}</div>
                                <div class="flex items-center justify-end gap-1 mt-1">
                                    <span class="text-xs text-green-100">${message.timestamp}</span>
                                    <!-- Indicateurs de statut -->
                                    <span class="message-status">
                                        ${message.status === 'sent' ? '✓' : ''}
                                        ${message.status === 'delivered' ? '✓✓' : ''}
                                        ${message.status === 'read' ? '✓✓' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="flex mb-4">
                            <div class="max-w-xs bg-white rounded-2xl px-4 py-2 shadow-sm">
                                <div class="text-sm">${escapeHtml(message.text)}</div>
                                <div class="text-xs text-gray-500 mt-1">${message.timestamp}</div>
                            </div>
                        </div>
                    `;
                }
            }).join('');
            
            messagesContainer.innerHTML = messagesHTML;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } else {
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="text-6xl mb-4">💬</div>
                    <div class="text-lg mb-2">Aucun message</div>
                    <div class="text-sm">Cette conversation n'a pas de messages</div>
                </div>
            </div>
        `;
    }
}

export function setContactOnlineStatus(contactId, isOnline) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.isOnline = isOnline;
        updateContactsList();
    }
}

export function initializeEventListeners() {
    console.log('Initializing contacts event listeners...');
    
    // Formulaire de création de contact
    const discussionForm = document.getElementById('discussionForm');
    if (discussionForm) {
        discussionForm.addEventListener('submit', submitForm);
        console.log('✓ Discussion form listener added');
    }
    
    // Champs du formulaire pour effacer les erreurs
    const prenomInput = document.getElementById('prenom');
    const nomInput = document.getElementById('nom');
    const contactInput = document.getElementById('contact');
    
    if (prenomInput) {
        prenomInput.addEventListener('input', () => clearError('prenom'));
    }
    if (nomInput) {
        nomInput.addEventListener('input', () => clearError('nom'));
    }
    if (contactInput) {
        contactInput.addEventListener('input', () => clearError('contact'));
    }
    
    // Envoi de message
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        console.log('✓ Message input listener added');
    }
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        console.log('✓ Send button listener added');
    }
    
    // Bouton de suppression des messages
    const deleteAllBtn = document.querySelector('#messages-section .bg-red-500');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', clearConversation);
        console.log('✓ Delete all messages button listener added');
    }
    
    // Ajouter les écouteurs d'événements pour détecter la saisie
    ['prenom', 'nom', 'contact'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                isTyping = true;
                validateField(fieldId);
            });
        }
    });
    
    console.log('✓ Contacts event listeners initialized');
}

export function initializeApp() {
    console.log('Initializing contacts app...');
    
    // Réinitialiser l'interface de chat
    resetChatInterface();
    
    console.log('✓ Contacts app initialized');
}

// Exposer les fonctions pour le HTML
window.selectContact = selectContact;
window.clearForm = clearForm;
window.submitForm = submitForm;
window.archiveCurrentDiscussion = archiveCurrentDiscussion;
window.unarchiveContact = unarchiveContact;
window.selectArchivedContact = selectArchivedContact;
window.sendMessage = sendMessage;
window.clearConversation = clearConversation;

export function sendArchivedMessage() {
    const input = document.getElementById('archivedMessageInput');
    const text = input.value.trim();
    
    if (!currentArchivedContact) {
        console.error('Aucun contact archivé sélectionné');
        return;
    }

    if (text) {
        const messageId = Date.now().toString();
        const message = {
            id: messageId,
            type: 'sent',
            text: text,
            timestamp: new Date().toLocaleTimeString(),
            status: 'sent'
        };

        if (!conversations[currentArchivedContact]) {
            conversations[currentArchivedContact] = [];
        }
        
        conversations[currentArchivedContact].push(message);
        displayArchivedMessage(message);
        input.value = '';
    }
}

function displayArchivedMessage(message) {
    const container = document.getElementById('archived-messages-container');
    const messageHTML = `
        <div class="flex justify-end mb-4" data-message-id="${message.id}">
            <div class="max-w-xs bg-green-500 text-white rounded-2xl px-4 py-2 shadow-sm">
                <div class="text-sm">${escapeHtml(message.text)}</div>
                <div class="flex items-center justify-end gap-1 mt-1">
                    <span class="text-xs text-green-100">${message.timestamp}</span>
                    <span class="message-status">✓</span>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', messageHTML);
    container.scrollTop = container.scrollHeight;
}

// Ajouter au window pour être accessible depuis le HTML
window.sendArchivedMessage = sendArchivedMessage;

// Exemple d'utilisation de setContactOnlineStatus
setContactOnlineStatus('id_du_contact', true); // Pour mettre en ligne
setContactOnlineStatus('id_du_contact', true); // Pour mettre hors ligne

// Ajouter cette fonction avant initializeEventListeners
function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    const value = input.value.trim();
    
    // Réinitialiser l'erreur avant validation
    clearError(fieldId);
    
    switch (fieldId) {
        case 'prenom':
            if (value === '') {
                showError('prenom', 'Le prénom est obligatoire');
            } else if (value.length < 2) {
                showError('prenom', 'Le prénom doit contenir au moins 2 caractères');
            }
            break;
            
        case 'nom':
            if (value === '') {
                showError('nom', 'Le nom est obligatoire');
            } else if (value.length < 2) {
                showError('nom', 'Le nom doit contenir au moins 2 caractères');
            }
            break;
            
        case 'contact':
            if (value === '') {
                showError('contact', 'Le numéro de téléphone est obligatoire');
            } else if (!validatePhoneNumber(value)) {
                showError('contact', 'Le numéro doit contenir au moins 3 chiffres');
            }
            break;
    }
}
