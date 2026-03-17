// Data Service for Supabase - Study Materials Management
class DataService {
    constructor() {
        this.supabase = window.supabase;
    }

    // Study Materials Management
    async getStudyMaterials(department = null, subject = null) {
        try {
            let query = this.supabase
                .from('study_materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (department) {
                query = query.eq('department', department);
            }
            if (subject) {
                query = query.eq('subject', subject);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async addStudyMaterial(material) {
        try {
            const { data, error } = await this.supabase
                .from('study_materials')
                .insert([{
                    title: material.title,
                    description: material.description,
                    department: material.department,
                    subject: material.subject,
                    type: material.type, // 'notes', 'question_paper', 'syllabus', 'model_answer'
                    file_url: material.file_url,
                    created_by: authService.getCurrentUser()?.id,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateStudyMaterial(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('study_materials')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async deleteStudyMaterial(id) {
        try {
            const { error } = await this.supabase
                .from('study_materials')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // User Progress Tracking
    async getUserProgress(userId = null) {
        try {
            const currentUserId = userId || authService.getCurrentUser()?.id;
            if (!currentUserId) throw new Error('User not authenticated');

            const { data, error } = await this.supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', currentUserId)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async updateUserProgress(materialId, progress) {
        try {
            const userId = authService.getCurrentUser()?.id;
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await this.supabase
                .from('user_progress')
                .upsert([{
                    user_id: userId,
                    material_id: materialId,
                    progress_percentage: progress.percentage,
                    completed: progress.completed,
                    time_spent: progress.timeSpent,
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // User Favorites
    async getUserFavorites(userId = null) {
        try {
            const currentUserId = userId || authService.getCurrentUser()?.id;
            if (!currentUserId) throw new Error('User not authenticated');

            const { data, error } = await this.supabase
                .from('user_favorites')
                .select(`
                    *,
                    study_materials (*)
                `)
                .eq('user_id', currentUserId);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async addToFavorites(materialId) {
        try {
            const userId = authService.getCurrentUser()?.id;
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await this.supabase
                .from('user_favorites')
                .insert([{
                    user_id: userId,
                    material_id: materialId,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async removeFromFavorites(materialId) {
        try {
            const userId = authService.getCurrentUser()?.id;
            if (!userId) throw new Error('User not authenticated');

            const { error } = await this.supabase
                .from('user_favorites')
                .delete()
                .eq('user_id', userId)
                .eq('material_id', materialId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // File Upload
    async uploadFile(file, bucketName = 'study-materials') {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await this.supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            return { success: true, url: publicUrl, fileName };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Search functionality
    async searchMaterials(query, filters = {}) {
        try {
            let supabaseQuery = this.supabase
                .from('study_materials')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

            // Apply filters
            if (filters.department) {
                supabaseQuery = supabaseQuery.eq('department', filters.department);
            }
            if (filters.subject) {
                supabaseQuery = supabaseQuery.eq('subject', filters.subject);
            }
            if (filters.type) {
                supabaseQuery = supabaseQuery.eq('type', filters.type);
            }

            const { data, error } = await supabaseQuery;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Get departments and subjects
    async getDepartments() {
        try {
            const { data, error } = await this.supabase
                .from('departments')
                .select('*')
                .order('name');

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getSubjects(department = null) {
        try {
            let query = this.supabase
                .from('subjects')
                .select('*')
                .order('name');

            if (department) {
                query = query.eq('department', department);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // User Profile
    async getUserProfile() {
        const user = authService.getCurrentUser();
        if (!user) return { success: false, message: 'User not authenticated' };

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('role, full_name, email, department, year_of_study')
                .eq('id', user.id)
                .single(); // .single() expects exactly one row

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Initialize data service
const dataService = new DataService();
window.dataService = dataService; 