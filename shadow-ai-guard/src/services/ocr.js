import apiClient from './api';

export const ocrService = {
  /**
   * Scans an image or PDF for sensitive data
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} Detection response
   */
  async scanFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/ocr/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("OCR Scan Error:", error);
      throw error;
    }
  },

  /**
   * Analyzes an image with a custom prompt, NER detection, and LLM processing
   * @param {File} file - The image file
   * @param {string} prompt - The user's custom prompt
   * @param {string} model - The LLM model to use
   * @returns {Promise<Object>} OCR Analyze response
   */
  async analyzeFile(file, prompt, model = "gemini-1.5-flash") {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      formData.append('model', model);
      
      const response = await apiClient.post('/ocr/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("OCR Analyze Error:", error);
      throw error;
    }
  }
};
