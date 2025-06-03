export class StatusManager {
    constructor() {
        this.onlineUsers = new Set();
    }

    setUserOnline(userId, isOnline) {
        const contact = document.querySelector(`[data-contact-id="${userId}"]`);
        if (contact) {
            const indicator = contact.querySelector('.online-indicator');
            const statusText = contact.querySelector('.status-text');
            
            if (isOnline) {
                this.onlineUsers.add(userId);
                indicator?.classList.replace('bg-gray-400', 'bg-green-500');
                statusText.textContent = 'En ligne';
            } else {
                this.onlineUsers.delete(userId);
                indicator?.classList.replace('bg-green-500', 'bg-gray-400');
                statusText.textContent = 'Hors ligne';
            }
        }
    }

    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }
}