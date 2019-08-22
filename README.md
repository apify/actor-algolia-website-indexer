# Algolia Website Indexer

The Indexer crawls a website using the Puppeteer browser (headless Chrome) and indexes the selected page to the Algolia index.
It was designed to run in an Apify actor.

## Usage

You can find instructions on how to run it in the Apify cloud on its Apify Store page.
If you want to run it in your environment, you can use the Apify CLI.

## Input

The input of the actor is JSON with the following parameters.

| Field | Type | Description |
| ----- | ---- | ----------- |
| algoliaAppId | String | Your Algolia Application ID |
| algoliaApiKey | String | Your Algolia API key |
| algoliaIndexName | String | Your Algolia index name  |
| crawlerName | String | Crawler name, it updates/removes/adds pages into the index regarding this name. In this case, you can have more websites in the index. |
| startUrls | Array | URLs where crawler starts crawling |
| selectors | Array | Selectors, which text content you want to index. Key is name of the attribute and value is the CSS selector.  |
| waitForElement | String | Selector of an element to wait on each page. |
| additionalPageAttrs | Object | Additional attributes you want to attach to each record in the index. |
| skipIndexUpdate | Boolean | Option to switch off updating the Algolia index. |

### Advanced

There are a few parameters not shown in the UI. These parameters change the behaviour of crawling, and you can set them up using the API or in the local environment.

| Field | Type | Description |
| ----- | ---- | ----------- |
| pageFunction | String | Overrides default pageFunction |
| pseudoUrls | Array | Overrides default pseudoUrls |
| clickableElements | String | Overrides default clickableElements |
| keepUrlFragment | Boolean | Option to switch on enqueueing URL with URL fragments |
| omitSearchParamsFromUrl | Boolean | Option to switch off enqueueing with search params. |

## Debug indexed pages

You can find all the pages that will be indexed in the default dataset for a specific actor run.
