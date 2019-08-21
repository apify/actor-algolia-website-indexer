# Algolia Website Indexer

Indexer crawls website using puppeteer browser(headless Chrome) and indexes selected page to Algolia index.
It was designed to run in Apify Actor.

## Usage

You can find instruction on how to run it in Apify cloud on Apify Store page.
If you want to run it on your environment, you can use Apify CLI.

## Input

The input of the actor is JSON with the following parameters.

| Field | Type | Description |
| ----- | ---- | ----------- |
| algoliaAppId | String | Your Algolia Application ID |
| algoliaApiKey | String | Your Algolia API key |
| algoliaIndexName | String | Your Algolia index name  |
| crawlerName | String | Crawler name, it updates/removes/adds pages into to index regarding this name. In this case, you can have more website in the index. |
| startUrls | Array | URLs where crawler starts crawling |
| selectors | Array | Selectors, which text content you want to index. Key is name of attribute and value is CSS selector.  |
| waitForElement | String | Selector of an element to wait on each page. |
| additionalPageAttrs | Object | Additional attributes you want to attach to each record in the index. |
| skipIndexUpdate | Boolean | Option to switch off updating Algolia index. |

### Advanced

There are a few parameters, which are not shown in UI. These parameters change the behaviour of crawling, and you can set up them on using API or on the local environment.

| Field | Type | Description |
| ----- | ---- | ----------- |
| pageFunction | String | Overrides default pageFunction |
| pseudoUrls | Array | Overrides default pseudoUrls |
| clickableElements | String | Overrides default clickableElements |
| keepUrlFragment | Boolean | Option to switch on enqueueing URL with URL fragments |
| omitSearchParamsFromUrl | Boolean | Option to switch off enqueueing with search params. |

## Debug indexed pages

You can find all pages, which will be indexed in default dataset for specific actor run.
