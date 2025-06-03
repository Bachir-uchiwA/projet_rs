import { contacts, archivedContacts, conversations } from './contacts.js';

// Variables globales
export let groups = [];
export let currentGroup = null;
export let groupConversations = {};

export function updateGroupsList() {
    console.log('Updating groups list...');
    const container = document.getElementById('groups-list');
    if (!container) {
        console.error('Groups container not found');
        return;
    }
    if (groups.length === 0) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-40">
                <div class="text-center text-gray-500">
                    <div class="text-6xl mb-4">👥</div>
                    <p class="text-lg mb-2">Aucun groupe disponible</p>
                    <p class="text-sm">Créez votre premier groupe</p>
                </div>
            </div>
        `;
        return;
    }

    const groupsHTML = groups.map(group => `
        <div class="flex w-full h-[10vh] px-[20px] py-[10px] cursor-pointer hover:bg-white transition-colors border-b border-gray-200"
             onclick="selectGroup('${group.id}')">
            <div class="bg-primary w-[8vh] h-[8vh] rounded-full flex items-center justify-center text-white font-bold">
                ${group.name.charAt(0).toUpperCase()}
            </div>
            <div class="w-[35vh] h-[8vh] flex-col flex ml-3">
                <div class="w-full h-[4vh] items-end pl-[5px] flex text-[18px]">
                    ${group.name}
                </div>
                <div class="w-full h-[4vh] items-start pl-[5px] flex text-[15px] text-gray-500">
                    ${group.members.length} membre${group.members.length > 1 ? 's' : ''}
                </div>
            </div>
            <div class="w-[15vh] h-[8vh] flex items-center justify-center">
                <div class="text-xs text-gray-400">
                    ${group.lastMessageTime || ''}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = groupsHTML;
    console.log('✓ Groups list updated with', groups.length, 'groups');
}

export function selectGroup(groupId) {
    console.log('Selecting group:', groupId);
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        console.error('Group not found:', groupId);
        return;
    }
    
    currentGroup = group;
    console.log('Current group set to:', group);
    
    // Mettre à jour l'en-tête du groupe
    updateGroupHeader(group);
    
    // Charger les messages du groupe
    loadGroupConversation(groupId);
    
    // Activer la zone de saisie
    enableGroupMessageInput(group);
}

function updateGroupHeader(group) {
    const groupName = document.getElementById('group-name');
    const groupMembersCount = document.getElementById('group-members-count');
    const groupAvatar = document.querySelector('#group-chat-header .bg-primary');
    
    if (groupName) {
        groupName.textContent = group.name;
    }
    
    if (groupMembersCount) {
        groupMembersCount.textContent = `${group.members.length} membre${group.members.length > 1 ? 's' : ''}`;
    }
    
    if (groupAvatar) {
        groupAvatar.textContent = group.name.charAt(0).toUpperCase();
    }
}

function enableGroupMessageInput(group) {
    const messageInput = document.getElementById('groupMessageInput');
    const sendBtn = document.getElementById('sendGroupMessageBtn');
    
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = `Tapez votre message dans ${group.name}...`;
    }
    
    if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.classList.remove('bg-gray-400');
        sendBtn.classList.add('bg-green-500', 'hover:bg-green-600');
    }
}

export function loadGroupConversation(groupId) {
    const messagesContainer = document.getElementById('group-messages');
    if (!messagesContainer) {
        console.error('Group messages container not found');
        return;
    }
    
    // Initialiser la conversation du groupe si elle n'existe pas
    if (!groupConversations[groupId]) {
        groupConversations[groupId] = [];
    }
    
    const messages = groupConversations[groupId];
    
    // Afficher le message d'accueil uniquement s'il n'y a pas de messages
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                <div class="text-center">
                    <div class="text-6xl mb-4">💬</div>
                    <div class="text-lg mb-2">Commencez la conversation</div>
                    <div class="text-sm">Envoyez le premier message du groupe</div>
                </div>
            </div>
        `;
        return;
    }
    
    // Sinon, afficher les messages
    const messagesHTML = messages.map(message => {
        if (message.type === 'sent') {
            return `
                <div class="flex justify-end mb-4">
                    <div class="max-w-xs bg-green-500 text-white rounded-2xl px-4 py-2 shadow-sm ">
                        <div class="text-xs text-green-200 mb-1">Vous</div> 
                        <div class="text-sm">${escapeHtml(message.text)}</div>
                        <div class="text-xs text-green-100 mt-1 text-right">${message.timestamp} ✓</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex mb-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                        ${message.senderName ? message.senderName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div class="max-w-xs bg-white rounded-2xl px-4 py-2 shadow-sm">
                        <div class="text-xs text-gray-500 mb-1">${message.senderName || 'Membre'}</div>
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

export function sendGroupMessage() {
    if (!currentGroup) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Aucun groupe sélectionné');
        }
        return;
    }
    
    const messageInput = document.getElementById('groupMessageInput');
    if (!messageInput) return;
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Initialiser la conversation du groupe si nécessaire
    if (!groupConversations[currentGroup.id]) {
        groupConversations[currentGroup.id] = [];
    }
    
    // Ajouter le message
    const newMessage = {
        id: Date.now().toString(),
        text: messageText,
        type: 'sent',
        timestamp: timestamp,
        senderId: 'user',
        senderName: 'Vous'
    };
    
    groupConversations[currentGroup.id].push(newMessage);
    
    // Mettre à jour le dernier message du groupe
    currentGroup.lastMessage = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
    currentGroup.lastMessageTime = timestamp;
    
    // Vider le champ
    messageInput.value = '';
    
    // Recharger la conversation
    loadGroupConversation(currentGroup.id);
    
    // Mettre à jour la liste des groupes
    updateGroupsList();
    
    // Simuler des réponses des membres après un délai
    setTimeout(() => {
        simulateGroupResponses();
    }, Math.random() * 3000 + 2000);
}

function simulateGroupResponses() {
    if (!currentGroup || !currentGroup.members) return;
    
    const responses = [
        "Parfait !",
        "Merci pour l'info",
        "👍",
        "D'accord",
        "Bien reçu",
        "OK",
        "Merci !",
        "Super",
        "👌",
        "Noté"
    ];
    
    // Simuler 1-3 réponses de membres différents
    const numResponses = Math.floor(Math.random() * 3) + 1;
    const respondingMembers = currentGroup.members
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(numResponses, currentGroup.members.length));
    
    respondingMembers.forEach((member, index) => {
        setTimeout(() => {
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            const responseMessage = {
                id: Date.now().toString() + '_' + member.id,
                text: randomResponse,
                type: 'received',
                timestamp: timestamp,
                senderId: member.id,
                senderName: `${member.prenom} ${member.nom}`
            };
            
            groupConversations[currentGroup.id].push(responseMessage);
            
            // Mettre à jour le dernier message
            currentGroup.lastMessage = randomResponse;
            currentGroup.lastMessageTime = timestamp;
            
            // Recharger si on regarde ce groupe
            if (currentGroup) {
                loadGroupConversation(currentGroup.id);
                updateGroupsList();
            }
        }, (index + 1) * 2000); // Délai entre les réponses
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function openCreateGroupModal() {
    console.log('Opening create group modal...');
    const modal = document.getElementById('createGroupModal');
    const membersList = document.getElementById('membersList');
    
    if (!modal || !membersList) {
        console.error('Modal elements not found');
        return;
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Afficher tous les contacts (actifs et archivés) à cocher
    const allContacts = [...contacts, ...archivedContacts];
    
    if (allContacts.length === 0) {
        membersList.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <p>Aucun contact disponible</p>
                <p class="text-sm">Créez des contacts pour pouvoir créer un groupe</p>
            </div>
        `;
        return;
    }
    
    membersList.innerHTML = allContacts.map(contact => `
        <div class="flex items-center space-x-3">
            <input type="checkbox" id="member-${contact.id}" value="${contact.id}" 
                   class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
            <label for="member-${contact.id}" class="flex items-center cursor-pointer">
                <span class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                </span>
                <span>
                    ${contact.prenom} ${contact.nom}
                    ${archivedContacts.find(c => c.id === contact.id) ? 
                        '<span class="text-sm text-gray-500 ml-2">(Archivé)</span>' : 
                        ''}
                </span>
            </label>
        </div>
    `).join('');
    
    console.log('✓ Create group modal opened');
}

export function closeCreateGroupModal() {
    console.log('Closing create group modal...');
    const modal = document.getElementById('createGroupModal');
    const form = document.getElementById('groupForm');
    
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    
    if (form) {
        form.reset();
    }
    
    // Cacher les erreurs
    const nameError = document.getElementById('groupName-error');
    const membersError = document.getElementById('members-error');
    
    if (nameError) nameError.classList.add('hidden');
    if (membersError) membersError.classList.add('hidden');
    
    console.log('✓ Create group modal closed');
}

export function createGroup(e) {
    if (e) e.preventDefault();
    
    const groupNameInput = document.getElementById('groupName');
    const groupDescriptionInput = document.getElementById('groupDescription');
    const groupName = groupNameInput ? groupNameInput.value.trim() : '';
    const groupDescription = groupDescriptionInput ? groupDescriptionInput.value.trim() : '';
    
    let isValid = true;
    const nameError = document.getElementById('groupName-error');
    const descriptionError = document.getElementById('groupDescription-error');
    const membersError = document.getElementById('members-error');
    
    // Réinitialiser les erreurs
    if (nameError) nameError.classList.add('hidden');
    if (descriptionError) descriptionError.classList.add('hidden');
    if (membersError) membersError.classList.add('hidden');

    // Validation du nom
    if (groupName.length < 3) {
        if (nameError) {
            nameError.textContent = 'Le nom du groupe doit contenir au moins 3 caractères';
            nameError.classList.remove('hidden');
        }
        isValid = false;
    }

    // Validation optionnelle de la description
    if (groupDescription && groupDescription.length > 0 && groupDescription.length < 3) {
        if (descriptionError) {
            descriptionError.textContent = 'La description doit contenir au moins 3 caractères';
            descriptionError.classList.remove('hidden');
        }
        isValid = false;
    }
    
    // Validation des membres
    const selectedMembers = Array.from(document.querySelectorAll('#membersList input[type="checkbox"]:checked'))
        .map(checkbox => contacts.find(c => c.id === checkbox.value))
        .filter(Boolean);
    
    if (selectedMembers.length < 2) {
        if (membersError) {
            membersError.textContent = 'Sélectionnez au moins 2 membres';
            membersError.classList.remove('hidden');
        }
        isValid = false;
    }
    
    if (!isValid) return;

    // Créer le groupe
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        description: groupDescription || '', // Si pas de description, mettre une chaîne vide
        members: selectedMembers,
        createdAt: new Date(),
        lastMessage: '',
        lastMessageTime: ''
    };
    
    groups.push(newGroup);
    updateGroupsList();
    closeCreateGroupModal();
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage(`Groupe "${groupName}" créé avec succès !`);
    }
}

function resetGroupInterface() {
    // Réinitialiser l'en-tête du groupe
    const groupName = document.getElementById('group-name');
    const groupMembersCount = document.getElementById('group-members-count');
    const groupAvatar = document.querySelector('#group-chat-header .bg-primary');
    
    if (groupName) {
        groupName.textContent = 'Sélectionnez un groupe';
    }
    
    if (groupMembersCount) {
        groupMembersCount.textContent = '0 membres';
    }
    
    if (groupAvatar) {
        groupAvatar.textContent = 'G';
    }
    
    // Réinitialiser la zone des messages
    const messagesContainer = document.getElementById('group-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-gray-500">
                Sélectionnez un groupe pour voir les messages
            </div>
        `;
    }
    
    // Désactiver la zone de saisie
    const messageInput = document.getElementById('groupMessageInput');
    const sendBtn = document.getElementById('sendGroupMessageBtn');
    
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = 'Sélectionnez un groupe pour commencer...';
        messageInput.value = '';
    }
    
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.classList.add('bg-gray-400');
        sendBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
    }
}

export function initializeEventListeners() {
    console.log('Initializing groups event listeners...');
    
    // Bouton de création de groupe
    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', openCreateGroupModal);
        console.log('✓ Create group button listener added');
    }
    
    // Formulaire de création de groupe
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        groupForm.addEventListener('submit', createGroup);
        console.log('✓ Group form listener added');
    }
    
    // Bouton d'annulation
    const cancelGroupBtn = document.getElementById('cancelGroupBtn');
    if (cancelGroupBtn) {
        cancelGroupBtn.addEventListener('click', closeCreateGroupModal);
        console.log('✓ Cancel group button listener added');
    }
    
    // Envoi de message de groupe
    const messageInput = document.getElementById('groupMessageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendGroupMessage();
            }
        });
        console.log('✓ Group message input listener added');
    }
    
    const sendBtn = document.getElementById('sendGroupMessageBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendGroupMessage);
        console.log('✓ Group send button listener added');
    }
    
    // Bouton d'ajout de membres
    const addMembersBtn = document.getElementById('addMembersBtn');
    if (addMembersBtn) {
        addMembersBtn.addEventListener('click', openAddMembersModal);
    }
    
    // Boutons du modal d'ajout de membres
    const cancelAddMembersBtn = document.getElementById('cancelAddMembersBtn');
    if (cancelAddMembersBtn) {
        cancelAddMembersBtn.addEventListener('click', closeAddMembersModal);
    }
    
    const confirmAddMembersBtn = document.getElementById('confirmAddMembersBtn');
    if (confirmAddMembersBtn) {
        confirmAddMembersBtn.addEventListener('click', addNewMembers);
    }
    
    console.log('✓ Groups event listeners initialized');
}

export function initializeApp() {
    console.log('Initializing groups app...');
    
    // Initialiser le tableau de groupes vide
    groups = [];
    groupConversations = {};
    
    // Réinitialiser l'interface de groupe
    resetGroupInterface();
    
    console.log('✓ Groups app initialized');
}

// Ajouter ces fonctions dans le fichier existant

export function openAddMembersModal() {
    if (!currentGroup) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Aucun groupe sélectionné');
        }
        return;
    }

    const modal = document.getElementById('addMembersModal');
    const membersList = document.getElementById('availableMembersList');
    
    if (!modal || !membersList) return;
    
    // Afficher le modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Obtenir tous les contacts qui ne sont pas encore dans le groupe
    const allContacts = [...contacts, ...archivedContacts];
    const availableContacts = allContacts.filter(contact => 
        !currentGroup.members.some(member => member.id === contact.id)
    );
    
    if (availableContacts.length === 0) {
        membersList.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <p>Aucun contact disponible</p>
                <p class="text-sm">Tous les contacts sont déjà membres du groupe</p>
            </div>
        `;
        return;
    }
    
    // Afficher les contacts disponibles
    membersList.innerHTML = availableContacts.map(contact => `
        <div class="flex items-center space-x-3">
            <input type="checkbox" 
                   id="add-member-${contact.id}" 
                   value="${contact.id}" 
                   class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary">
            <label for="add-member-${contact.id}" class="flex items-center cursor-pointer">
                <span class="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm mr-2">
                    ${contact.prenom.charAt(0).toUpperCase()}${contact.nom.charAt(0).toUpperCase()}
                </span>
                <span>${contact.prenom} ${contact.nom}</span>
            </label>
        </div>
    `).join('');
}

export function closeAddMembersModal() {
    const modal = document.getElementById('addMembersModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

export function addNewMembers() {
    if (!currentGroup) return;
    
    const selectedMembers = Array.from(document.querySelectorAll('#availableMembersList input[type="checkbox"]:checked'))
        .map(checkbox => {
            const contactId = checkbox.value;
            return [...contacts, ...archivedContacts].find(c => c.id === contactId);
        })
        .filter(Boolean);
    
    if (selectedMembers.length === 0) {
        if (window.showErrorMessage) {
            window.showErrorMessage('Sélectionnez au moins un membre à ajouter');
        }
        return;
    }
    
    // Ajouter les nouveaux membres au groupe
    currentGroup.members.push(...selectedMembers);
    
    // Mettre à jour l'interface
    updateGroupHeader(currentGroup);
    updateGroupsList();
    
    // Ajouter un message système dans la conversation
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const systemMessage = {
        id: Date.now().toString(),
        type: 'system',
        text: `${selectedMembers.map(m => m.prenom + ' ' + m.nom).join(', ')} ${selectedMembers.length > 1 ? 'ont été ajoutés' : 'a été ajouté'} au groupe`,
        timestamp: timestamp
    };
    
    if (!groupConversations[currentGroup.id]) {
        groupConversations[currentGroup.id] = [];
    }
    groupConversations[currentGroup.id].push(systemMessage);
    
    // Recharger la conversation
    loadGroupConversation(currentGroup.id);
    
    // Fermer le modal
    closeAddMembersModal();
    
    if (window.showSuccessMessage) {
        window.showSuccessMessage(`${selectedMembers.length} membre${selectedMembers.length > 1 ? 's' : ''} ajouté${selectedMembers.length > 1 ? 's' : ''} au groupe`);
    }
}

// Exposer les fonctions pour le HTML
window.selectGroup = selectGroup;
window.openCreateGroupModal = openCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.createGroup = createGroup;
window.sendGroupMessage = sendGroupMessage;
window.openAddMembersModal = openAddMembersModal;
window.closeAddMembersModal = closeAddMembersModal;
window.addNewMembers = addNewMembers;