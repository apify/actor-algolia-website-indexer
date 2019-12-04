const Apify = require('apify');
const _ = require('underscore');
const algoliasearch = require('algoliasearch');
const algoliaIndex = require('./algolia_index');
const { setUpCrawler } = require('./crawler');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { algoliaAppId, algoliaIndexName, algoliaApiKey = process.env.ALGOLIA_API_KEY, skipIndexUpdate, crawlerName } = input;

    const algoliaClient = algoliasearch(algoliaAppId, algoliaApiKey);
    const algoliaSearchIndex = algoliaClient.initIndex(algoliaIndexName);

    // Run crawler for teh website
    const crawler = await setUpCrawler(input);
    await crawler.run();

    // Sometimes it takes some time to write data to dataset, this should ensure that all data will be in dataset.
    await Apify.utils.sleep(5000);

    const dataset = await Apify.openDataset();
    const datasetInfo = await dataset.getInfo();
    console.log(`Crawler finished, it found ${datasetInfo.cleanItemCount} pages to index!`);

    // Compare scraped pages with pages already saved to index and creates object with differences
    const pagesInIndex = await algoliaIndex.browseAll(algoliaSearchIndex, crawlerName);
    console.log(`There are ${pagesInIndex.length} pages in the index for ${crawlerName}.`);
    const pagesIndexByUrl = _.indexBy(pagesInIndex, 'url');

    const pagesDiff = {
        pagesToAdd: {},
        pagesToUpdate: {},
        pagesToRemove: pagesIndexByUrl,
    };

    const limit = 10000;
    const uniqueDatasetResults = {};
    for (let offset = 0;offset < datasetInfo.itemCount; offset += limit) {
        const datasetResult = await dataset.getData({ clean: true, offset, limit });
        Object.assign(uniqueDatasetResults, _.indexBy(datasetResult.items, 'url'));
    }

    Object.values(uniqueDatasetResults).forEach((page) => {
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

    await Apify.setValue('OUTPUT', pagesDiff);

    // Performs updates in index
    if (skipIndexUpdate) console.log('Index updates were skipped!');
    else await algoliaIndex.update(algoliaSearchIndex, pagesDiff);

    console.log('Done!')
});
