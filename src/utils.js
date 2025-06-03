// Vérifier la connexion au début de chaque fichier JS

// Fonction pour afficher les messages de succès
export function showSuccessMessage(message) {
    console.log('Success:', message)
    
    // Créer ou récupérer le conteneur de notifications
    let container = document.getElementById('notifications-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'notifications-container'
        container.className = 'fixed top-4 right-4 z-50 space-y-2'
        document.body.appendChild(container)
    }
    
    // Créer la notification
    const notification = document.createElement('div')
    notification.className = 'bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0'
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
        </div>
    `
    
    container.appendChild(notification)
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0')
        notification.classList.add('translate-x-0', 'opacity-100')
    }, 100)
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('translate-x-full', 'opacity-0')
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove()
                }
            }, 300)
        }
    }, 5000)
}

// Fonction pour afficher les messages d'erreur
export function showErrorMessage(message) {
    console.error('Error:', message)
    
    // Créer ou récupérer le conteneur de notifications
    let container = document.getElementById('notifications-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'notifications-container'
        container.className = 'fixed top-4 right-4 z-50 space-y-2'
        document.body.appendChild(container)
    }
    
    // Créer la notification d'erreur
    const notification = document.createElement('div')
    notification.className = 'bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0'
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
            </svg>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
            </button>
        </div>
    `
    
    container.appendChild(notification)
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0')
        notification.classList.add('translate-x-0', 'opacity-100')
    }, 100)
    
    // Auto-suppression après 7 secondes (plus long pour les erreurs)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('translate-x-full', 'opacity-0')
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove()
                }
            }, 300)
        }
    }, 7000)
}

// Fonction pour valider les numéros de téléphone
export function validatePhoneNumber(phone) {
    // Accepte les numéros avec au moins 3 chiffres
    return /^\d{3,}$/.test(phone)
}

// Fonction pour formater les numéros de téléphone
export function formatPhoneNumber(phone) {
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '')
    
    // Formater selon la longueur
    if (cleaned.length === 9) {
        // Format sénégalais: 77 123 45 67
        return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')
    } else if (cleaned.length === 10) {
        // Format français: 06 12 34 56 78
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
    }
    
    return phone; // Retourner tel quel si pas de format reconnu
}

// Fonction pour échapper le HTML
export function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Fonction pour générer un ID unique
export function generateId() {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
}

// Fonction pour formater la date/heure
export function formatTimestamp(date = new Date()) {
    return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    })
}

export function formatDate(date = new Date()) {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Fonction pour débouncer les événements (utile pour la recherche)
export function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Fonction pour copier du texte dans le presse-papiers
export function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => {
            showSuccessMessage('Copié dans le presse-papiers')
        }).catch(() => {
            showErrorMessage('Erreur lors de la copie')
        })
    } else {
        // Fallback pour les navigateurs plus anciens
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
            document.execCommand('copy')
            showSuccessMessage('Copié dans le presse-papiers')
        } catch (err) {
            showErrorMessage('Erreur lors de la copie')
        } finally {
            textArea.remove()
        }
    }
}

// Fonction pour vérifier si un élément est visible dans le viewport
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

// Fonction pour faire défiler vers un élément
export function scrollToElement(element, behavior = 'smooth') {
    if (element) {
        element.scrollIntoView({ behavior, block: 'center' })
    }
}

// Fonction pour créer un délai (Promise)
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Fonction pour nettoyer les chaînes de caractères
export function sanitizeString(str) {
    return str.trim().replace(/\s+/g, ' ')
}

// Fonction pour vérifier si une chaîne est vide ou ne contient que des espaces
export function isEmpty(str) {
    return !str || str.trim().length === 0
}

// Fonction pour tronquer un texte
export function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

// Fonction pour capitaliser la première lettre
export function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Fonction pour capitaliser chaque mot
export function capitalizeWords(str) {
    if (!str) return ''
    return str.split(' ').map(word => capitalize(word)).join(' ')
}

// Exposer les fonctions principales globalement
window.showSuccessMessage = showSuccessMessage
window.showErrorMessage = showErrorMessage