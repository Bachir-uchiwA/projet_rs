import * as contactsModule from './contacts.js';
import * as groupsModule from './groups.js';
import * as diffusionsModule from './diffusions.js';
import * as utils from './utils.js';
import * as navigation from './navigation.js';
import { StatusManager } from './status.js';

const statusManager = new StatusManager();

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INITIALISATION DE L\'APPLICATION ===');
    
    try {
        // Initialiser la navigation en premier
        navigation.initializeNavigation();
        console.log('✓ Navigation initialized');
        
        // Initialiser les modules dans l'ordre
        console.log('Initializing modules...');
        
        // Contacts en premier (car les autres en dépendent)
        if (contactsModule.initializeEventListeners) {
            contactsModule.initializeEventListeners();
        }
        if (contactsModule.initializeApp) {
            contactsModule.initializeApp();
        }
        console.log('✓ Contacts module initialized');
        
        // Groupes
        if (groupsModule.initializeEventListeners) {
            groupsModule.initializeEventListeners();
        }
        if (groupsModule.initializeApp) {
            groupsModule.initializeApp();
        }
        console.log('✓ Groups module initialized');
        
        // Diffusions
        if (diffusionsModule.initializeEventListeners) {
            diffusionsModule.initializeEventListeners();
        }
        if (diffusionsModule.initializeApp) {
            diffusionsModule.initializeApp();
        }
        console.log('✓ Diffusions module initialized');
        
        // Commencer par la section messages
        navigation.switchSection('messages');
        console.log('✓ Switched to messages section');
        
        console.log('=== APPLICATION INITIALISÉE AVEC SUCCÈS ===');
        
        // Message de bienvenue
        setTimeout(() => {
            utils.showSuccessMessage('Application chargée avec succès !');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        utils.showErrorMessage('Erreur lors du chargement de l\'application');
    }
});

// Exposer les fonctions globalement pour le HTML
console.log('Exposing global functions...');

// Navigation
window.switchSection = navigation.switchSection;

// Utils
window.showSuccessMessage = utils.showSuccessMessage;
window.showErrorMessage = utils.showErrorMessage;

// Contacts
window.selectContact = contactsModule.selectContact;
window.clearForm = contactsModule.clearForm;
window.submitForm = contactsModule.submitForm;
window.archiveCurrentDiscussion = contactsModule.archiveCurrentDiscussion;
window.unarchiveContact = contactsModule.unarchiveContact;
window.selectArchivedContact = contactsModule.selectArchivedContact;
window.sendMessage = contactsModule.sendMessage;
window.clearConversation = contactsModule.clearConversation;

// Groupes
window.selectGroup = groupsModule.selectGroup;
window.openCreateGroupModal = groupsModule.openCreateGroupModal;
window.closeCreateGroupModal = groupsModule.closeCreateGroupModal;
window.createGroup = groupsModule.createGroup;
window.sendGroupMessage = groupsModule.sendGroupMessage;

// Diffusions
window.toggleContactSelection = diffusionsModule.toggleContactSelection;
window.filterDiffusions = diffusionsModule.filterDiffusions;
window.sendDiffusionMessage = diffusionsModule.sendDiffusionMessage;
window.removeFromSelection = diffusionsModule.removeFromSelection;
window.clearSelection = diffusionsModule.clearSelection;
window.selectAllContacts = diffusionsModule.selectAllContacts;

console.log('✓ All functions exposed globally');

// Fonction de diagnostic pour le debug
window.diagnoseApp = function() {
    console.log('=== DIAGNOSTIC DE L\'APPLICATION ===');
    console.log('Contacts:', contactsModule.contacts?.length || 0);
    console.log('Archived contacts:', contactsModule.archivedContacts?.length || 0);
    console.log('Groups:', groupsModule.groups?.length || 0);
    console.log('Selected diffusions:', diffusionsModule.selectedDiffusions?.length || 0);
    console.log('Selected contacts:', diffusionsModule.selectedContacts?.length || 0);
    console.log('Selected diffusion contacts:', diffusionsModule.selectedDiffusionContacts?.size || 0);
    console.log('Current section:', document.querySelector('.content-section:not(.hidden)')?.id || 'none');
    console.log('Available functions:', {
        switchSection: typeof window.switchSection,
        selectContact: typeof window.selectContact,
        submitForm: typeof window.submitForm,
        openCreateGroupModal: typeof window.openCreateGroupModal,
        toggleContactSelection: typeof window.toggleContactSelection
    });
    console.log('=== FIN DU DIAGNOSTIC ===');
};

// Gestion des erreurs globales
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    utils.showErrorMessage('Une erreur inattendue s\'est produite');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    utils.showErrorMessage('Erreur de traitement asynchrone');
});

console.log('✓ Main.js loaded and configured');
