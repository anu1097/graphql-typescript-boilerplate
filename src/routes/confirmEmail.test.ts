import fetch from "node-fetch";

test("checks if it sends incorrect response when invalid url is hit", async () => {
	const response = await fetch(`${process.env.TEST_HOST}/confirm/12312312`);
	const responseText = await response.text();
	expect(responseText).toEqual("UserId invalid");
});
