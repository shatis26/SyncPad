import api from "./api";

/**
 * Document-related API calls.
 */
const documentService = {
    async create(title) {
        const { data } = await api.post("/documents", { title });
        return data;
    },

    async getAll() {
        const { data } = await api.get("/documents");
        return data;
    },

    async getById(id) {
        const { data } = await api.get(`/documents/${id}`);
        return data;
    },

    async join(id) {
        const { data } = await api.post(`/documents/${id}/join`);
        return data;
    },

    async getVersions(id) {
        const { data } = await api.get(`/documents/${id}/versions`);
        return data;
    },

    async revertToVersion(docId, versionId) {
        const { data } = await api.post(
            `/documents/${docId}/revert/${versionId}`
        );
        return data;
    },
};

export default documentService;
