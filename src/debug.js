// Vérifier la connexion au début de chaque fichier JS
// if (!localStorage.getItem('isLoggedIn') && window.location.pathname.indexOf('login.html') === -1) {
//     window.location.href = 'login.html';
// }

// Créer ce fichier pour diagnostiquer les problèmes
export function diagnoseNavigation() {
    console.log('=== DIAGNOSTIC DE NAVIGATION ===');
    
    // Vérifier les éléments du DOM
    const sidebarItems = document.querySelectorAll('[data-section]');
    const contentSections = document.querySelectorAll('.content-section');
    
    console.log('Éléments sidebar trouvés:', sidebarItems.length);
    sidebarItems.forEach((item, i) => {
        console.log(`  ${i}: data-section="${item.getAttribute('data-section')}"`);
    });
    
    console.log('Sections de contenu trouvées:', contentSections.length);
    contentSections.forEach((section, i) => {
        console.log(`  ${i}: id="${section.id}", classes="${section.className}"`);
    });
    
    // Vérifier les modules
    console.log('Modules disponibles:');
    console.log('  window.switchSection:', typeof window.switchSection);
    console.log('  window.showSuccessMessage:', typeof window.showSuccessMessage);
    
    // Test de navigation
    console.log('Test de navigation...');
    try {
        if (window.switchSection) {
            window.switchSection('messages');
            console.log('✓ Navigation vers messages réussie');
        } else {
            console.error('✗ window.switchSection non disponible');
        }
    } catch (error) {
        console.error('✗ Erreur lors du test de navigation:', error);
    }
    
    console.log('=== FIN DU DIAGNOSTIC ===');
}

// Exposer pour utilisation dans la console
window.diagnoseNavigation = diagnoseNavigation;