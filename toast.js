function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    gsap.fromTo(toast, 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
    );
    
    setTimeout(() => {
        gsap.to(toast, {
            y: 100,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => toast.remove()
        });
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
