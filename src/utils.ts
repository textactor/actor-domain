
export function mapPromise<T, R>(keys: T[], callback: (key: T) => Promise<R>):
    Promise<Map<T, R>> {
    const tasks = keys.map(key => callback(key).then(result => ({ key, result })));

    return Promise.all(tasks)
        .then(results => {
            const response: Map<T, R> = new Map();

            for (let item of results) {
                response.set(item.key, item.result);
            }

            return response;
        });
}
