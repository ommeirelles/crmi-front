

class UserService {
    #endpoint = ""

    constructor(endpoint) {
        this.#endpoint = endpoint
    }

    /** @param {FormData} data  */
    createUser(data) {
        return fetch(`${this.#endpoint}/user`, {
            method: "POST",
            body: data
        })
    }


    /** @param {FormData} data  */
    login(data) {
        return fetch(`${this.#endpoint}/user/auth`, {
            method: "POST",
            body: data
        })
    }
}