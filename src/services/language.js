class LanguageService {
    #endpoint = ""

    constructor(endpoint) {
        this.#endpoint = endpoint
    }

    /** @returns {Promise<Array<{code: string, name: string, id: number}>>} */
    async getLanguages() {
        try {
            /** @type {{languages: Array<{code: string, name: string, id: number}>}} */
            const data = await fetch(`${this.#endpoint}/languages`, {
                method: "GET",
                headers: { "Authorization": JSON.parse(sessionStorage.getItem("user")).token }
            }).then(res => res.json())
            return data?.["languages"] ?? []
        } catch (e) {
            console.error(e);
            return []
        }
    }


    /** @returns {Promise<{code: string, name: string, id: number}>} */
    async createLanguage(code, name) {
        try {
            /** @type {{code: string, name: string, id: number}} */
            const data = await fetch(`${this.#endpoint}/language`, {
                method: "POST",
                headers: {
                    "Authorization": JSON.parse(sessionStorage.getItem("user")).token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, language: code })
            }).then(res => 'json' in res && typeof res.json === "function" && res.json() || undefined)
            return data
        } catch (e) {
            console.error(e);
            return undefined
        }
    }
}