class Chatbot {
    constructor() {
        this.chatContainer = null;
        this.chatIcon = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.injectHTML();
        this.chatContainer = document.getElementById('chatbot-container');
        this.chatIcon = document.getElementById('chatbot-icon');
        
        this.chatIcon.addEventListener('click', () => this.toggleChat());
        document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
    }

    injectHTML() {
        const botHTML = `
            <div id="chatbot-icon">
                <i class="fa fa-comments"></i>
            </div>
            <div id="chatbot-container" class="closed">
                <div id="chatbot-header">
                    <h3>College Assistant</h3>
                    <button id="chatbot-close">&times;</button>
                </div>
                <div id="chatbot-messages"></div>
                <div id="chatbot-input-container">
                    <input type="text" id="chatbot-input" placeholder="Ask about the college...">
                    <button id="chatbot-send"><i class="fa fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', botHTML);
        this.addWelcomeMessage();
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatContainer.classList.toggle('closed');
        this.chatIcon.classList.toggle('closed');
    }

    addWelcomeMessage() {
        this.addMessage('bot', 'Welcome to GLB Needs! How can I help you with information about the college?');
    }

    sendMessage() {
        const inputField = document.getElementById('chatbot-input');
        const userMessage = inputField.value.trim();
        if (userMessage === '') return;

        this.addMessage('user', userMessage);
        inputField.value = '';

        const botResponse = this.findResponse(userMessage);
        setTimeout(() => {
            this.addMessage('bot', botResponse);
        }, 500);
    }

    addMessage(sender, message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `chatbot-message ${sender}-message`;
        messageElement.innerHTML = `<p>${message}</p>`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    findResponse(userMessage) {
        const query = userMessage.toLowerCase();

        // Check for direct matches in FAQs
        if (collegeInfo.faqs[query]) {
            return collegeInfo.faqs[query];
        }

        // Keyword-based matching
        if (query.includes('admission') || query.includes('apply')) return collegeInfo.admissions.process;
        if (query.includes('fee') || query.includes('cost')) return `You can find the detailed fee structure here: <a href="${collegeInfo.admissions.fees_url}" target="_blank">Fee Structure</a>.`;
        if (query.includes('course') || query.includes('branch')) return "We offer B.Tech in: " + collegeInfo.admissions.btech_courses.join(', ') + ". We also have MBA and MCA programs.";
        if (query.includes('location') || query.includes('address')) return collegeInfo.general.location;
        if (query.includes('contact') || query.includes('phone') || query.includes('email')) return `You can contact the college at: Phone: ${collegeInfo.general.contact.phone}, Email: ${collegeInfo.general.contact.email}. Or visit the website: <a href="${collegeInfo.general.contact.website}" target="_blank">Official Website</a>.`;
        if (query.includes('hostel') || query.includes('stay')) return collegeInfo.campus_life.hostel;
        if (query.includes('event') || query.includes('fest')) return collegeInfo.campus_life.events;
        if (query.includes('club')) return "There are many student clubs, including: " + collegeInfo.campus_life.clubs.join(', ') + ".";
        
        return "I'm sorry, Currently I don't have information about that. You might find an answer on the <a href='https://www.glbitm.org/' target='_blank'>official college website</a> or by contacting them directly.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
}); 