/**
 * Utility functions for managing note drafts
 */

const DRAFT_KEY = 'draft';
const DRAFT_EXPIRY_HOURS = 24;

export const draftUtils = {
  /**
   * Save a draft to localStorage
   */
  save: (title, body, editingId = null) => {
    if (!title && !body) return false;

    const draft = {
      title: title || '',
      body: body || '',
      editingId,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      return true;
    } catch (error) {
      console.warn('Failed to save draft:', error);
      return false;
    }
  },

  /**
   * Load a draft from localStorage
   */
  load: () => {
    try {
      const draftData = localStorage.getItem(DRAFT_KEY);
      if (!draftData) return null;

      const draft = JSON.parse(draftData);

      // Check if draft is expired (older than 24 hours)
      const isExpired = Date.now() - draft.timestamp > DRAFT_EXPIRY_HOURS * 60 * 60 * 1000;

      if (isExpired) {
        draftUtils.clear();
        return null;
      }

      return draft;
    } catch (error) {
      console.warn('Failed to load draft:', error);
      draftUtils.clear();
      return null;
    }
  },

  /**
   * Clear the draft from localStorage
   */
  clear: () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to clear draft:', error);
      return false;
    }
  },

  /**
   * Check if a draft exists
   */
  exists: () => {
    const draft = draftUtils.load();
    return draft !== null && (draft.title || draft.body);
  },

  /**
   * Get draft age in minutes
   */
  getAge: () => {
    const draft = draftUtils.load();
    if (!draft) return 0;

    return Math.floor((Date.now() - draft.timestamp) / (1000 * 60));
  }
};