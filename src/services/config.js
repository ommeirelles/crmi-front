class Config {
    #env = Object.freeze({
        endpoint: "http://127.0.0.1:5000"
    });

    get env() {
        return this.#env
    }
}