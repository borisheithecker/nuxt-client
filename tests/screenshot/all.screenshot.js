const fs = require("fs");
const { storybookUrl, routesFilePath } = require("./config");
const ignoredStories = require("./ignoredStories");

const blockRequest = (request) => {
	// block webpack hot reload connection
	if (request.url().endsWith("__webpack_hmr")) {
		request.abort();
	} else {
		request.continue();
	}
};

const storyNotIgnored = (storyPath) =>
	!ignoredStories.some(
		(regexString) => !!new RegExp(regexString).exec(storyPath)
	);

// get all stories to screenshot, except ignored ones
const stories = JSON.parse(fs.readFileSync(routesFilePath)).filter(
	storyNotIgnored
);

it("have routes to test", () => {
	expect(stories.length).not.toBe(0);
	// eslint-disable-next-line no-console
	console.log(`${stories.length} stories to screenshot found`);
});

describe("screenshots", () => {
	jest.setTimeout(10000); // 10s
	stories.forEach((storyPath) => {
		const storyName = storyPath.replace("/story/", "");
		const [group, name] = storyName.split("--");
		describe(group, () => {
			it(name, async () => {
				page = await browser.newPage();
				await page.setRequestInterception(true);
				page.on("request", blockRequest);
				await page.goto(`${storybookUrl}/iframe.html?path=${storyPath}`, {
					waitUntil: "networkidle0",
				});
				const image = await page.screenshot();
				expect(image).toMatchImageSnapshot({
					customDiffConfig: {
						threshold: 0.1,
					},
					failureThresholdType: "percent",
					failureThreshold: 3, // accept <x% overall diff
				});
			});
		});
	});
});
