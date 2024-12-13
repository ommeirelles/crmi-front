class NamespaceService {
    #endpoint = ""

    constructor(endpoint) {
        this.#endpoint = endpoint
    }

    /** 
     * @param {string} language 
     * @returns {Promise<Array<{id: number, name: string, language_id: number}>>} 
     * */
    async getNamespaces(language) {
        try {
            /** @type {{namespaces: Array<{id: number, name: string, language_id: number}>}} */
            const data = await fetch(`${this.#endpoint}/language/${language}/namespaces`, {
                method: "GET",
                headers: { "Authorization": JSON.parse(sessionStorage.getItem("user")).token }
            }).then(res => res.json())
            return data?.["namespaces"] ?? []
        } catch (e) {
            console.error(e);
            return []
        }
    }


    /** @returns {Promise<{id: number, name: string, language_id: number} | undefined>} */
    createNamespace(name, language) {
        try {
            /** @type {{id: number, name: string, language_id: number}} */
            return fetch(`${this.#endpoint}language/${language}/namespace`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": JSON.parse(sessionStorage.getItem("user")).token
                },
                body: JSON.stringify({
                    name, language
                })
            }).then(res => res.json())
        } catch (e) {
            console.error(e);

            return undefined
        }
    }

    getNamespaceData(name, language) {
        try {
            return fetch(`${this.#endpoint}/language/${language}/namespace/${name}`, {
                method: "GET",
                headers: { "Authorization": JSON.parse(sessionStorage.getItem("user")).token }
            }).then(res => res.json().catch(() => undefined))
        } catch (e) {
            console.error(e);
            return []
        }
    }

    saveNamespaceData(namespace, language, data) {
        try {
            /** @type {{id: number, name: string, language_id: number}} */
            return fetch(`${this.#endpoint}/language/${language}/namespace/${namespace}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": JSON.parse(sessionStorage.getItem("user")).token
                },
                body: JSON.stringify(data)
            }).then(res => res.json().catch(() => undefined))
        } catch (e) {
            console.error(e);

            return undefined
        }
    }
}