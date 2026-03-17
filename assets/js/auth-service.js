// Authentication Service for Supabase
class AuthService {
    constructor() {
        this.supabase = window.supabase;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Get initial session
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.updateUIForAuthenticatedUser();
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                // Ensure profile exists for this user
                this.ensureUserProfile().finally(() => {
                this.updateUIForAuthenticatedUser();
                this.redirectToHome();
                });
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUIForUnauthenticatedUser();
                this.redirectToSignIn();
            }
        });
    }

    async ensureUserProfile() {
        try {
            const user = this.currentUser;
            if (!user) return;
            // Check if profile exists
            const { data: existing, error: fetchError } = await this.supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                // Ignore "No rows found" (PGRST116); log other errors
                console.warn('Profile fetch error (ignored if 404):', fetchError);
            }

            if (!existing) {
                // Create profile
                const { error: insertError } = await this.supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        full_name: user.user_metadata?.full_name || 'User',
                        email: user.email
                    }]);
                if (insertError) {
                    console.warn('Profile create error:', insertError);
                }
            }
        } catch (e) {
            console.warn('ensureUserProfile error:', e);
        }
    }

    async signUp(email, password, fullName) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;

            // The database trigger 'handle_new_user' will automatically create the profile.
            // No need to manually call createUserProfile here.

            return { success: true, message: 'Account created successfully! Please check your email for verification.' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, message: 'Signed in successfully!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true, message: 'Signed out successfully!' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async createUserProfile(userId, fullName, email) {
        // This function is not needed when the DB trigger is active.
        /*
        try {
            const { error } = await this.supabase
                .from('profiles')
                .insert([
                    {
                        id: userId,
                        full_name: fullName,
                        email: email
                    }
                ]);

            // Return the error object to be handled by the caller
            return error;
        } catch (error) {
            console.error('Error creating user profile:', error);
            return error;
        }
        */
    }

    async updateUIForAuthenticatedUser() {
        const nav = document.querySelector('.main-menu');
        const authLinks = document.getElementById('auth-links');

        if (nav && authLinks) {
            authLinks.style.display = 'none';

            let userMenu = document.getElementById('user-menu');
            if (!userMenu) {
                userMenu = document.createElement('li');
                userMenu.id = 'user-menu';
                userMenu.className = 'has-submenu';
                nav.appendChild(userMenu);
            }

            // Fetch user profile to check role
            const { success, data: profile } = await dataService.getUserProfile();
            let uploadLink = '';
            if (success && profile.role === 'admin') {
                uploadLink = '<li><a href="upload.html">Upload Material</a></li>';
            }

            userMenu.innerHTML = `
                <a href="#"><i class="fa fa-user"></i> ${this.currentUser.user_metadata?.full_name || 'User'}</a>
                <ul class="sub-menu">
                    ${uploadLink}
                    <li><a href="#" onclick="authService.signOut()">Sign Out</a></li>
                </ul>
            `;
        }
    }

    updateUIForUnauthenticatedUser() {
        // Remove user menu
        const userMenu = document.querySelector('.main-menu li:last-child');
        if (userMenu) userMenu.remove();

        // Show sign in/sign up links
        const signInLinks = document.querySelectorAll('a[href*="signin"], a[href*="signup"]');
        signInLinks.forEach(link => link.style.display = 'inline');

        const nav = document.querySelector('.main-menu');
        const authLinks = document.getElementById('auth-links');

        // Remove user menu if it exists
        if (userMenu) {
            userMenu.remove();
        }

        // Show sign in/sign up links
        if (authLinks) {
            authLinks.style.display = 'list-item';
        }
    }

    redirectToHome() {
        if (window.location.pathname.includes('signin.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = 'index.html';
        }
    }

    redirectToSignIn() {
        if (!window.location.pathname.includes('signin.html')) {
            window.location.href = 'signin.html';
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth service
const authService = new AuthService();
window.authService = authService; 