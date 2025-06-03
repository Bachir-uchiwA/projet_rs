import * as contactsModule from './contacts.js';
import * as groupsModule from './groups.js';
import * as diffusionsModule from './diffusions.js';

export function switchSection(section) {
    console.log('Switching to section:', section);
    
    // Masquer toutes les sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('flex');
    });
    
    // Afficher la section ciblée
    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('flex');
        console.log('Section displayed:', section);
    } else {
        console.error('Section not found:', section + '-section');
    }
    
    // Mettre à jour le sidebar
    const sidebarItems = document.querySelectorAll('[data-section]');
    sidebarItems.forEach(item => {
        if (item.getAttribute('data-section') === section) {
            item.classList.add('bg-[#DEB449]');
            item.classList.remove('hover:bg-[#DEB449]');
        } else {
            item.classList.remove('bg-[#DEB449]');
            item.classList.add('hover:bg-[#DEB449]');
        }
    });
    
    // Mettre à jour les listes selon la section
    try {
        if (section === 'diffusions') {
            if (diffusionsModule.updateDiffusionsList) {
                diffusionsModule.updateDiffusionsList();
            }
        } else if (section === 'groupes') {
            if (groupsModule.updateGroupsList) {
                groupsModule.updateGroupsList();
            }
        } else if (section === 'messages') {
            if (contactsModule.updateContactsList) {
                contactsModule.updateContactsList();
            }
        } else if (section === 'archives') {
            if (contactsModule.updateArchivedContactsList) {
                contactsModule.updateArchivedContactsList();
            }
        }
    } catch (error) {
        console.error('Error updating section content:', error);
    }
}

export function initializeNavigation() {
    console.log('Initializing navigation...');
    
    const sidebarItems = document.querySelectorAll('[data-section]');
    console.log('Found sidebar items:', sidebarItems.length);
    
    sidebarItems.forEach((item, index) => {
        const section = item.getAttribute('data-section');
        console.log(`Adding listener to item ${index}: ${section}`);
        
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sidebar item clicked:', section);
            if (section) {
                switchSection(section);
            }
        });
    });
    
    console.log('Navigation initialized successfully');
}

// Exposer pour debug
window.switchSection = switchSection;
