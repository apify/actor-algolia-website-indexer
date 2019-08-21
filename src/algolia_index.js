const browseAll = async (index, crawledBy) => {
    const browser = index.browseAll(null, { filters: `crawledBy:${crawledBy}` });
    let items = [];
    await new Promise((done, failed) => {
        browser.on('result', (content) => {
            // NOTE: In some cases filter param doesn't work ...
            const filteredItems = content.hits.filter(item => item.crawledBy === crawledBy);
            items = items.concat(filteredItems);
        });

        browser.on('end', () => {
            done('finished');
        });

        browser.on('error', (err) => {
            failed(err);
        });
    });

    return items;
};

const update = async (index, pagesDiff) => {
    const pagesToAdd = Object.values(pagesDiff.pagesToAdd);
    if (pagesToAdd.length) {
        console.log(`Adding following pages to the index\n${pagesToAdd.map(page => page.url).join('\n')}`);
        await index.addObjects(pagesToAdd);
    }

    const pagesToUpdated = Object.values(pagesDiff.pagesToUpdate);
    if (pagesToUpdated.length) {
        console.log(`Updating following pages in the index\n${pagesToUpdated.map(page => page.url).join('\n')}`);
        await index.saveObjects(pagesToUpdated);
    }

    const pagesToRemove = Object.values(pagesDiff.pagesToRemove);
    if (pagesToRemove.length) {
        console.log(`Removing following pages in the index\n${pagesToRemove.map(page => page.url).join('\n')}`);
        await index.deleteObjects(pagesToRemove.map(item => item.objectID));
    }
};

module.exports = {
    browseAll,
    update,
};
