const Apify = require('apify');
const _ = require('underscore');
const algoliasearch = require('algoliasearch');
const algoliaIndex = require('./algolia_index');
const { setUpCrawler } = require('./crawler');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { algoliaAppId, algoliaIndexName, algoliaApiKey, skipIndexUpdate, crawlerName } = input;

    const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
    const algoliaSearchIndex = algoliaClient.initIndex(algoliaIndexName);

    const crawler = await setUpCrawler(input);
    await crawler.run();

    const dataset = await Apify.openDataset();
    const datasetInfo = await dataset.getInfo();
    console.log(`Crawler finished, it found ${datasetInfo.cleanItemCount} pages to index!`);

    const pagesInIndex = await algoliaIndex.browseAll(algoliaSearchIndex, crawlerName);
    console.log(`There are ${pagesInIndex.length} pages in the index for ${crawlerName}.`);
    const pagesIndexByUrl = _.indexBy(pagesInIndex, 'url');

    const pagesDiff = {
        pagesToAdd: {},
        pagesToUpdate: {},
        pagesToRemove: pagesIndexByUrl,
    };

    const limit = 10000;
    for (let offset = 0;offset < datasetInfo.itemCount; offset += limit) {
        const datasetResult = await dataset.getData({ clean: true, offset, limit });
        datasetResult.items.forEach((page) => {
            const { url } = page;
            if (pagesIndexByUrl[url]) {
                pagesDiff.pagesToUpdate[url] = {
                    ...page,
                    objectID: pagesIndexByUrl[url].objectID,
                };
            } else {
                pagesDiff.pagesToAdd[url] = page;
            }
            delete pagesDiff.pagesToRemove[url];
        });
    }

    await Apify.setValue('OUTPUT', pagesDiff);

    if (!skipIndexUpdate) await algoliaIndex.update(algoliaSearchIndex, pagesDiff);
});
