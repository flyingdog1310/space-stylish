const staticUrl = process.env.STATIC_URL;

function staticUrlFixer(data, urlKey) {
    return data.map((elements) => {
        return {
            ...elements,
            [urlKey]: staticUrl + elements[urlKey],
        };
    });
}

export {staticUrlFixer};