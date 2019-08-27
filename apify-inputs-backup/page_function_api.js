module.exports = async ({ page, request, selectors, Apify }) => {
    const url = 'https://apify.com/docs/api/v2';

    await page.waitForSelector('h1.humanColumnApiName');

    let results = await page.evaluate((url) => {
        const results = [];
        // Parse Introduction part
        let sectionIntroTitleEl;
        let sectionIntroHtml = [];
        const sectionIntroEls = $('.humanColumnApiDescription').children();
        sectionIntroEls.each(function(index) {
            if ($(this).is('h2')) {
                if (sectionIntroTitleEl) {
                    const title = sectionIntroTitleEl.text().trim();
                    results.push({
                        url: `${url}#/introduction/${title.toLocaleLowerCase().replace(/\s/, '-')}`,
                        title,
                        text:  sectionIntroHtml.join(' '),
                    });
                } else {
                    results.push({
                        url: `${url}#/introduction`,
                        title: 'Introduction',
                        text: sectionIntroHtml.join(' '),
                    });
                }
                sectionIntroHtml = [];
                sectionIntroTitleEl = $(this);
            } else {
                sectionIntroHtml.push($(this).html());
                if (sectionIntroEls.length === index + 1) {
                    const title = sectionIntroTitleEl.text().trim();
                    results.push({
                        url: `${url}#/introduction/${title.toLocaleLowerCase().replace(/\s/, '-')}`,
                        title,
                        text:  sectionIntroHtml.join(' '),
                    });
                }
            }
        });

        // Parse Refference part
        const h1s = $('.humanColumnSectionReference h1');

        h1s.each(function() {
            const h1Path = $(this).text().trim().toLocaleLowerCase().replace(/\s/, '-');
            const h1Text = $(this).text().trim();

            results.push({
                url: `${url}#/reference/${h1Path}`,
                title: h1Text,
                text:  $(this).siblings().map(function() {return $(this).html()}).toArray().join(' '),
            });

            const h2s = $(this).parent().find('h2');

            h2s.each(function() {
                const h2Path = $(this).text().trim().toLocaleLowerCase().replace(/\s/, '-');

                const actions = $(this).parent().find('.action');
                actions.each(function() {
                    const actionPath = $(this).find('a').text().trim().toLocaleLowerCase().replace(/\s/, '-');
                    results.push({
                        url:`${url}#/reference/${h1Path}/${h2Path}/${actionPath}`,
                        title: [h1Text, $(this).find('.actionName').html()].join(': '),
                        text: $(this).find('.actionDescription').html(),
                    });
                });
            });
        });

        return results;
    }, url);

    results = results.map((item) => {
        Object.keys(item).forEach((key) => {
            item[key] = Apify.utils.htmlToText(item[key]).substring(0, 9500);
        });
        return item;
    });

    return results;
};
