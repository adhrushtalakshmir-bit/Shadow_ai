import apiClient from './api';

export const historyService = {
  /**
   * Fetch all scan history records
   * @returns {Promise<Array>} List of history records
   */
  async getHistory() {
    try {
      const response = await apiClient.get('/history');
      return response.data;
    } catch (error) {
      console.error("Get History Error:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific scan history record
   * @param {string} id - The scan ID
   * @returns {Promise<Object>} History record
   */
  async getHistoryById(id) {
    try {
      const response = await apiClient.get(`/history/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get History By ID Error:", error);
      throw error;
    }
  },

  /**
   * Delete a scan history record
   * @param {string} id - The scan ID
   * @returns {Promise<Object>} Success message
   */
  async deleteHistory(id) {
    try {
      const response = await apiClient.delete(`/history/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete History Error:", error);
      throw error;
    }
  }
};
