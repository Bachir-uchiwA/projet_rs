// Variables globales à déplacer hors du DOMContentLoaded
let currentContact = null;
let contacts = [];
let conversations = {};
let selectedDiffusionContacts = new Set();
let diffusionContacts = [];
let diffusionConversations = {};
let groups = [];
let currentGroup = null;
let currentUser = {
    id: 'admin',
    prenom: 'Admin',
    nom: 'User',
    isAdmin: true
};
let archivedContacts = []; // <-- Nouvelle variable pour les contacts archivés
let archivedDiscussions = new Map(); // Pour stocker les discussions archivées

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des écouteurs d'événements
    initializeEventListeners();
    
    // Initialisation de l'application
    initializeApp();
});

function initializeEventListeners() {
    // Navigation
    const sidebarItems = document.querySelectorAll('[data-section]');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Groupes
    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', openCreateGroupModal);
    }

    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', createGroup);
    }

    const cancelGroupBtn = document.getElementById('cancelGroupBtn');
    if (cancelGroupBtn) {
        cancelGroupBtn.addEventListener('click', closeCreateGroupModal);
    }

    // Diffusions
    const diffusionsSearch = document.getElementById('diffusionsSearch');
    if (diffusionsSearch) {
        diffusionsSearch.addEventListener('input', (e) => filterDiffusions(e.target.value));
    }

    const diffusionsMessageInput = document.getElementById('diffusionsMessageInput');
    if (diffusionsMessageInput) {
        diffusionsMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.target.disabled) {
                sendDiffusionMessage();
            }
        });
    }

    const diffusionsSendBtn = document.getElementById('diffusionsSendBtn');
    if (diffusionsSendBtn) {
        diffusionsSendBtn.addEventListener('click', sendDiffusionMessage);
    }

    // Ajouter l'écouteur pour le bouton d'archive
    const archiveBtn = document.getElementById('archiveContactBtn');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', archiveCurrentDiscussion);
    }
}

function switchSection(section) {
    // Sélectionner toutes les sections de contenu
    const contentSections = document.querySelectorAll('.content-section');
    
    // Masquer toutes les sections
    contentSections.forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('flex');
    });
    
    // Afficher la section ciblée
    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('flex');
    }
    
    // Mettre à jour l'état actif du sidebar
    const sidebarItems = document.querySelectorAll('[data-section]');
    sidebarItems.forEach(item => {
        const isActive = item.getAttribute('data-section') === section;
        if (isActive) {
            item.classList.add('bg-[#DEB449]');
            item.classList.remove('hover:bg-[#DEB449]');
        } else {
            item.classList.remove('bg-[#DEB449]');
            item.classList.add('hover:bg-[#DEB449]');
        }
    });

    // Mise à jour des listes selon la section
    if (section === 'diffusions') {
        updateDiffusionsList();
    } else if (section === 'groupes') {
        updateGroupsList();
    } else if (section === 'messages') {
        updateContactsList();
    } else if (section === 'archives') {
        updateArchivedContactsList();
    }
}

function initializeApp() {
    // Mettre à jour toutes les listes au démarrage
    updateContactsList();
    updateGroupsList();
    updateDiffusionsList();
    updateArchivedContactsList(); // <-- Mise à jour des archives
    
    // Commencer par la section messages
    switchSection('messages');

    // Ajouter les écouteurs d'événements pour la validation en temps réel
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
}

// Fonction pour ouvrir le modal de création de groupe
function openCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    const membersList = document.getElementById('membersList');
    
    // Afficher le modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Générer la liste des contacts disponibles
    membersList.innerHTML = contacts.map(contact => `
        <div class="flex items-center space-x-3">
            <input type="checkbox" 
                   id="member-${contact.id}" 
                   value="${contact.id}"
                   class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
            <label for="member-${contact.id}" class="flex items-center">
                <span class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    ${contact.prenom.charAt(0)}${contact.nom.charAt(0)}
                </span>
                <span>${contact.prenom} ${contact.nom}</span>
            </label>
        </div>
    `).join('');
}

// Fonction pour fermer le modal
function closeCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Réinitialiser le formulaire
    document.getElementById('groupForm').reset();
    clearGroupErrors();
}

// Fonction pour nettoyer les erreurs
function clearGroupErrors() {
    ['groupName', 'members'].forEach(fieldId => {
        const errorDiv = document.getElementById(`${fieldId}-error`);
        if (errorDiv) {
            errorDiv.classList.add('hidden');
            errorDiv.textContent = '';
        }
    });
}

// Fonction pour valider et créer le groupe
function createGroup(e) {
    e.preventDefault();
    clearGroupErrors();
    
    const groupName = document.getElementById('groupName').value.trim();
    const selectedMembers = Array.from(document.querySelectorAll('#membersList input[type="checkbox"]:checked'))
        .map(checkbox => contacts.find(c => c.id === checkbox.value))
        .filter(contact => contact); // Filtrer les undefined
    
    let isValid = true;
    
    // Validation du nom du groupe
    if (groupName.length < 3) {
        showGroupError('groupName', 'Le nom du groupe doit contenir au moins 3 caractères');
        isValid = false;
    }
    
    // Validation du nombre de membres
    if (selectedMembers.length < 2) {
        showGroupError('members', 'Sélectionnez au moins 2 membres');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Créer le nouveau groupe
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: [
            {
                id: currentUser.id,
                name: `${currentUser.prenom} ${currentUser.nom}`,
                isAdmin: true
            },
            ...selectedMembers.map(member => ({
                id: member.id,
                name: `${member.prenom} ${member.nom}`,
                isAdmin: false
            }))
        ],
        messages: [],
        createdAt: new Date()
    };
    
    // Ajouter le groupe à la liste
    groups.push(newGroup);
    
    // Mettre à jour l'affichage
    updateGroupsList();
    
    // Fermer le modal
    closeCreateGroupModal();
    
    // Afficher un message de succès
    showSuccessMessage('Groupe créé avec succès !');

    console.log('Nouveau groupe créé:', newGroup);
    console.log('Liste des groupes:', groups);
}

// Fonction pour afficher les erreurs
function showGroupError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

// Gestion de la navigation dans le sidebar
document.addEventListener('DOMContentLoaded', function() {
    const sidebarItems = document.querySelectorAll('[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Fonction pour changer de section
    function switchSection(targetSection) {
        // Cacher toutes les sections
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Afficher la section ciblée
        const targetElement = document.getElementById(targetSection + '-section');
        if (targetElement) {
            targetElement.classList.remove('hidden');
        }
        
        // Mettre à jour l'état actif du sidebar
        sidebarItems.forEach(item => {
            item.classList.remove('bg-[#DEB449]');
            item.classList.add('hover:bg-[#DEB449]');
        });
        
        // Ajouter la classe active à l'élément cliqué
        const activeItem = document.querySelector(`[data-section="${targetSection}"]`);
        if (activeItem) {
            activeItem.classList.add('bg-[#DEB449]');
            activeItem.classList.remove('hover:bg-[#DEB449]');
        }
    }
    
    // Ajouter les événements de clic pour la navigation
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Initialiser avec la section Messages active
    switchSection('messages');
    
    // Initialiser les fonctionnalités
    initializeApp();
});

// Initialisation de l'application
function initializeApp() {
    // Form handling
    const discussionForm = document.getElementById('discussionForm');
    if (discussionForm) {
        discussionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm();
        });
    }
    
    // Message input handling pour Messages
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !this.disabled) {
                sendMessage();
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (!this.disabled) {
                sendMessage();
            }
        });
    }
    
    // Message input handling pour Diffusions
    const diffusionsMessageInput = document.getElementById('diffusionsMessageInput');
    const diffusionsSendBtn = document.getElementById('diffusionsSendBtn');
    
    if (diffusionsMessageInput) {
        diffusionsMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !this.disabled) {
                sendDiffusionMessage();
            }
        });
    }
    
    if (diffusionsSendBtn) {
        diffusionsSendBtn.addEventListener('click', function() {
            if (!this.disabled) {
                sendDiffusionMessage();
            }
        });
    }
    
    // Disable message inputs initially
    if (messageInput) messageInput.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    if (diffusionsMessageInput) diffusionsMessageInput.disabled = true;
    if (diffusionsSendBtn) diffusionsSendBtn.disabled = true;
    
    // Delete all messages button
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', deleteAllMessages);
    }
    
    // Recherche dans les diffusions
    const diffusionsSearch = document.getElementById('diffusionsSearch');
    if (diffusionsSearch) {
        diffusionsSearch.addEventListener('input', function(e) {
            filterDiffusions(e.target.value);
        });
    }
    
    // Initialiser les groupes
    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', openCreateGroupModal);
    }

    // Initialiser les diffusions
    initializeDiffusions();

    // Mettre à jour les listes initiales
    updateContactsList();
    updateGroupsList();
    updateDiffusionsList();
}

// Fonction pour sélectionner un contact exemple
function selectExampleContact(name, date) {
    const exampleContact = {
        id: 'example-' + name,
        prenom: name.split(' ')[0] || name,
        nom: name.split(' ')[1] || '',
        contact: 'Contact exemple',
        lastMessage: '',
        timestamp: date
    };
    
    // Créer une conversation exemple si elle n'existe pas
    if (!conversations[exampleContact.id]) {
        conversations[exampleContact.id] = [
            {
                text: "Bonjour ! Comment allez-vous ?",
                time: "12:23",
                sent: false
            }
        ];
    }
    
    selectContact(exampleContact);
}

// Fonction pour vider le formulaire
function clearForm() {
    // Réinitialiser les valeurs des champs
    const fields = ['prenom', 'nom', 'contact'];
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.value = '';
            input.classList.remove('border-red-500'); // Enlever la bordure rouge
        }
        
        // Nettoyer les messages d'erreur
        const errorDiv = document.getElementById(`${fieldId}-error`);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.add('hidden');
        }
    });
}

// Fonction pour soumettre le formulaire
function validatePhoneNumber(phone) {
    // Vérifier si le numéro contient uniquement des chiffres
    return /^\d{3,}$/.test(phone);
}

function showError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        // Ajouter une bordure rouge à l'input
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add('border-red-500');
        }
    }
}

function clearError(fieldId) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.classList.add('hidden');
        // Retirer la bordure rouge
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('border-red-500');
        }
    }
}

function submitForm() {
    const form = document.getElementById('discussionForm');
    if (!form) return;
    
    const prenom = document.getElementById('prenom')?.value.trim() || '';
    const nom = document.getElementById('nom')?.value.trim() || '';
    const contact = document.getElementById('contact')?.value.trim() || '';
    
    let isValid = true;

    // Nettoyer les erreurs précédentes
    ['prenom', 'nom', 'contact'].forEach(fieldId => {
        clearError(fieldId);
    });

    // Validation du prénom
    if (prenom === '') {
        showError('prenom', 'Le prénom est obligatoire');
        isValid = false;
    } else if (prenom.length < 2) {
        showError('prenom', 'Le prénom doit contenir au moins 2 caractères');
        isValid = false;
    }
    
    // Validation du nom
    if (nom === '') {
        showError('nom', 'Le nom est obligatoire');
        isValid = false;
    } else if (nom.length < 2) {
        showError('nom', 'Le nom doit contenir au moins 2 caractères');
        isValid = false;
    }
    
    // Validation du contact
    if (contact === '') {
        showError('contact', 'Le numéro de téléphone est obligatoire');
        isValid = false;
    } else if (!validatePhoneNumber(contact)) {
        showError('contact', 'Le numéro doit être composé uniquement de chiffres (minimum 3 chiffres)');
        isValid = false;
    }
    
    if (!isValid) return;

    // Si tous les champs sont valides, créer le contact
    const newContact = {
        id: Date.now().toString(),
        prenom: prenom,
        nom: nom,
        contact: contact,
        timestamp: new Date().toLocaleDateString('fr-FR'),
        lastMessage: ''
    };
    
    // Ajouter le contact à la liste
    contacts.push(newContact);
    updateContactsList();
    clearForm(); // Nettoie les champs et les messages d'erreur
    showSuccessMessage(`Contact ${prenom} ${nom} ajouté avec succès !`);
}

// Fonction pour mettre à jour la liste des contacts dans la section messages
function updateContactsList() {
    const container = document.getElementById('contacts-container');
    if (!container) return;
    
    // Si aucun contact n'existe encore
    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <p class="text-gray-500">Aucun contact disponible</p>
            </div>
        `;
        return;
    }
    
    // Générer le HTML pour chaque contact
    const contactsHTML = contacts.map(contact => `
        <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors" 
             onclick="selectContact('${contact.id}')">
            <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                ${contact.prenom.charAt(0)}${contact.nom.charAt(0)}
            </div>
            <div class="w-[40vh] h-[8vh] flex-col flex">
                <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                    ${contact.prenom} ${contact.nom}
                </div>
                <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px]">
                    ${contact.contact}
                </div>
            </div>
            <div class="w-[20vh] h-[8vh]">
                <div class="w-full h-[4vh] flex justify-center items-end">
                    <label class="text-green-600">${contact.timestamp}</label>
                </div>
                <div class="w-full h-[4vh] flex justify-center items-start pt-[5px]">
                    <div class="h-[10px] w-[10px] bg-green-500 rounded-[100px]"></div>
                </div>
            </div>
            <div class="w-[8vh] h-[8vh] flex items-center justify-center">
                <button onclick="archiveCurrentDiscussion(event, '${contact.id}')" 
                        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Archiver la discussion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="text-gray-600" viewBox="0 0 16 16">
                        <path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = contactsHTML;
}

// Ajouter la fonction de sélection de contact
function selectContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    // Mettre à jour l'en-tête du chat
    const header = document.querySelector('#messages-section .bg-[#F0EFE8]');
    if (header) {
        const avatar = header.querySelector('.rounded-full');
        const name = header.querySelector('.font-semibold');
        
        if (avatar) avatar.textContent = contact.prenom.charAt(0);
        if (name) name.textContent = `${contact.prenom} ${contact.nom}`;
    }

    // Activer la zone de chat
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    if (messageInput) messageInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
}

// Mettre à jour les messages
function updateMessages() {
    const container = document.getElementById('messages-container');
    if (!container) return;
    
    if (!currentContact) {
        container.innerHTML = '<div class="text-center text-gray-500 text-sm">Sélectionnez un contact pour commencer une conversation</div>';
        return;
    }
    
    const messages = conversations[currentContact.id] || [];
    
    if (messages.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 text-sm">Aucun message. Commencez la conversation!</div>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="flex ${msg.sent ? 'justify-end' : ''} mb-4">
            <div class="max-w-xs ${msg.sent ? 'bg-green-500 text-white' : 'bg-white'} rounded-2xl px-4 py-2 shadow-sm">
                <div class="text-sm">${msg.text}</div>
                <div class="text-xs ${msg.sent ? 'text-green-100' : 'text-gray-500'} mt-1 ${msg.sent ? 'text-right' : ''}">
                    ${msg.time}${msg.sent ? ' ✓' : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
}

// Envoyer un message
function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input || !currentContact) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const message = {
        text: text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: true
    };
    
    conversations[currentContact.id].push(message);
    input.value = '';
    updateMessages();
    
    // Simuler une réponse automatique après 1 seconde
    setTimeout(() => {
        if (currentContact) {
            const autoReply = {
                text: "Message reçu !",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                sent: false
            };
            conversations[currentContact.id].push(autoReply);
            updateMessages();
        }
    }, 1000);
}

// Supprimer tous les messages
function deleteAllMessages() {
    if (!currentContact) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les messages de cette conversation ?')) {
        conversations[currentContact.id] = [];
        updateMessages();
    }
}

// ===== FONCTIONS POUR LES DIFFUSIONS =====

// Ajouter les contacts créés aux diffusions
function addContactsToDiffusions() {
    if (contacts.length === 0) {
        alert('Aucun contact à ajouter. Créez d\'abord des contacts dans la section "Nouveau".');
        return;
    }
    
    // Ajouter tous les contacts qui ne sont pas déjà dans les diffusions
    contacts.forEach(contact => {
        const exists = diffusionContacts.find(dc => dc.id === contact.id);
        if (!exists) {
            diffusionContacts.push({...contact});
            diffusionConversations[contact.id] = [];
        }
    });
    
    updateDiffusionsList();
    
    // Animation de confirmation
    const btn = document.getElementById('addToDiffusionsBtn');
    if (btn) {
        btn.classList.add('scale-90');
        btn.classList.add('bg-green-600');
        setTimeout(() => {
            btn.classList.remove('scale-90');
            btn.classList.remove('bg-green-600');
        }, 200);
    }
    
    console.log('Contacts ajoutés aux diffusions:', diffusionContacts);
}

function updateGroupsList() {
    const container = document.getElementById('groups-list');
    if (!container) return;

    if (groups.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <p class="text-gray-500">Aucun groupe disponible</p>
            </div>
        `;
        return;
    }

    container.innerHTML = groups.map(group => `
        <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-200" 
             onclick="selectGroup('${group.id}')">
            <div class="bg-primary w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                ${group.name.charAt(0)}
            </div>
            <div class="w-[40vh] h-[8vh] flex-col flex ml-3">
                <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                    ${group.name}
                </div>
                <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                    ${group.members.length} membres
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Groupes mis à jour:', groups.length, 'groupes');
}

function updateDiffusionsList() {
    const container = document.getElementById('diffusions-list');
    if (!container) {
        console.error('Container des diffusions non trouvé');
        return;
    }

    // Utiliser directement la liste des contacts
    if (contacts.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <p class="text-gray-500">Aucun contact disponible</p>
            </div>
        `;
        return;
    }

    container.innerHTML = contacts.map(contact => `
        <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors">
            <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                ${contact.prenom.charAt(0)}${contact.nom.charAt(0)}
            </div>
            <div class="w-[40vh] h-[8vh] flex-col flex">
                <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                    ${contact.prenom} ${contact.nom}
                </div>
                <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px]">
                    ${contact.contact}
                </div>
            </div>
            <div class="w-[20vh] h-[8vh] flex items-center justify-center">
                <div class="w-6 h-6 border-2 border-green-500 rounded-full cursor-pointer transition-all hover:scale-110 flex items-center justify-center ${selectedDiffusionContacts.has(contact.id) ? 'bg-green-500' : ''}"
                     onclick="toggleContactSelection(event, '${contact.id}')">
                    ${selectedDiffusionContacts.has(contact.id) ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="white" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');

    updateSelectionCounter();
    console.log('Diffusions mises à jour:', contacts.length, 'contacts');
}

// Ajouter la fonction de sélection de contact pour les diffusions
function toggleContactSelection(event, contactId) {
    event.stopPropagation();
    
    if (selectedDiffusionContacts.has(contactId)) {
        selectedDiffusionContacts.delete(contactId);
    } else {
        selectedDiffusionContacts.add(contactId);
    }
    
    updateDiffusionsList();
    toggleMessageInputArea();
}

function updateSelectionCounter() {
    const counter = document.getElementById('selection-counter');
    if (counter) {
        const count = selectedDiffusionContacts.size;
        counter.textContent = count > 0 ? `${count} contact${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}` : '';
    }
}

function sendDiffusionMessage() {
    const input = document.getElementById('diffusionsMessageInput');
    if (!input || selectedDiffusionContacts.size === 0) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    const message = {
        text: text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: true
    };
    
    // Envoyer le message à tous les contacts sélectionnés
    selectedDiffusionContacts.forEach(contactId => {
        if (!diffusionConversations[contactId]) {
            diffusionConversations[contactId] = [];
        }
        diffusionConversations[contactId].push(message);
    });
    
    // Réinitialiser
    input.value = '';
    selectedDiffusionContacts.clear();
    updateDiffusionsList();
    toggleMessageInputArea();
    
    // Message de confirmation
    showSuccessMessage(`Message envoyé à ${selectedDiffusionContacts.size} contact(s)`);
}

// Ajouter ces fonctions manquantes
function filterDiffusions(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Si le terme de recherche est vide, afficher tous les contacts
    if (!term) {
        diffusionContacts = [...contacts];
        updateDiffusionsList();
        return;
    }
    
    // Filtrer les contacts qui correspondent au terme de recherche
    diffusionContacts = contacts.filter(contact => 
        contact.prenom.toLowerCase().includes(term) ||
        contact.nom.toLowerCase().includes(term) ||
        contact.contact.includes(term)
    );
    
    updateDiffusionsList();
}

function toggleMessageInputArea() {
    const messageArea = document.getElementById('diffusions-message-input-area');
    const messageInput = document.getElementById('diffusionsMessageInput');
    const sendBtn = document.getElementById('diffusionsSendBtn');
    const infoDiv = document.getElementById('diffusion-info');
    
    if (selectedDiffusionContacts.size > 0) {
        // Activer la zone de message
        messageArea.classList.remove('hidden');
        messageInput.disabled = false;
        sendBtn.disabled = false;
        if (infoDiv) infoDiv.classList.add('hidden');
    } else {
        // Désactiver la zone de message
        messageArea.classList.add('hidden');
        messageInput.disabled = true;
        sendBtn.disabled = true;
        if (infoDiv) infoDiv.classList.remove('hidden');
    }
}

// S'assurer que les fonctions sont disponibles globalement
window.selectGroup = selectGroup;
window.openCreateGroupModal = openCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.createGroup = createGroup;
window.toggleContactSelection = toggleContactSelection;
window.filterDiffusions = filterDiffusions;
window.sendDiffusionMessage = sendDiffusionMessage;

// Fonction pour archiver un contact
function archiveCurrentContact() {
    if (!currentContact) return;
    
    // Retirer le contact de la liste des contacts actifs
    contacts = contacts.filter(contact => contact.id !== currentContact.id);
    
    // Ajouter le contact à la liste des archives
    archivedContacts.push({
        ...currentContact,
        archivedDate: new Date().toLocaleDateString('fr-FR')
    });
    
    // Mettre à jour les listes
    updateContactsList();
    updateArchivedContactsList();
    
    // Réinitialiser le contact courant
    currentContact = null;
    
    // Afficher un message de succès
    showSuccessMessage(`Contact archivé avec succès`);
}

// Fonction pour archiver la discussion actuelle
function archiveCurrentDiscussion(event, contactId) {
    // Empêcher la propagation du clic
    event.stopPropagation();
    
    // Trouver le contact à archiver
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    // Retirer le contact de la liste des contacts actifs
    contacts = contacts.filter(c => c.id !== contactId);
    
    // Ajouter le contact aux archives
    archivedContacts.push({
        ...contact,
        archivedDate: new Date().toLocaleDateString('fr-FR')
    });
    
    // Mettre à jour les deux listes
    updateContactsList();
    updateArchivedContactsList();
    
    // Afficher un message de succès
    showSuccessMessage('Discussion archivée avec succès');
}

function updateArchivedContactsList() {
    const container = document.getElementById('archives-container');
    if (!container) return;

    // Si aucun contact archivé
    if (archivedContacts.length === 0) {
        container.innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Archives</h2>
            <p class="text-gray-600">Aucune discussion archivée</p>
        `;
        return;
    }

    // Générer le HTML pour chaque contact archivé
    const archivedHTML = `
        <h2 class="text-2xl font-bold mb-4">Archives</h2>
        ${archivedContacts.map(contact => `
            <div class="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg mb-2 hover:bg-gray-50">
                <div class="flex items-center space-x-3">
                    <div class="bg-[#747477] w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                        ${contact.prenom.charAt(0)}${contact.nom.charAt(0)}
                    </div>
                    <div class="flex flex-col">
                        <span class="font-semibold">${contact.prenom} ${contact.nom}</span>
                        <span class="text-sm text-gray-500">${contact.contact}</span>
                        <span class="text-xs text-gray-400">Archivé le ${contact.archivedDate}</span>
                    </div>
                </div>
                <button 
                    onclick="unarchiveContact('${contact.id}')"
                    class="px-4 py-2 bg-[#DEB449] text-white rounded-lg hover:bg-[#C69F41] transition-colors"
                >
                    Désarchiver
                </button>
            </div>
        `).join('')}
    `;

    container.innerHTML = archivedHTML;
}

// Fonction pour désarchiver un contact
function unarchiveContact(contactId) {
    // Trouver le contact dans les archives
    const archivedContact = archivedContacts.find(c => c.id === contactId);
    if (!archivedContact) return;
    
    // Retirer le contact des archives
    archivedContacts = archivedContacts.filter(c => c.id !== contactId);
    
    // Supprimer la date d'archivage
    const {archivedDate, ...contactWithoutArchiveDate} = archivedContact;
    
    // Remettre le contact dans la liste active
    contacts.push(contactWithoutArchiveDate);
    
    // Mettre à jour les deux listes
    updateContactsList();
    updateArchivedContactsList();
    
    // Afficher un message de succès
    showSuccessMessage('Contact désarchivé avec succès');
}

// Fonction pour désarchiver une discussion
function unarchiveDiscussion(contactId) {
    const archivedData = archivedDiscussions.get(contactId);
    if (!archivedData) return;
    
    // Restaurer les messages
    conversations[contactId] = archivedData.messages;
    
    // Supprimer des archives
    archivedDiscussions.delete(contactId);
    
    // Mettre à jour l'affichage
    updateArchivedContactsList();
    if (currentContact && currentContact.id === contactId) {
        updateMessages();
    }
    
    showSuccessMessage('Discussion restaurée avec succès');
}

// Ajouter aux fonctions globales
window.archiveCurrentDiscussion = archiveCurrentDiscussion;
window.unarchiveContact = unarchiveContact;

