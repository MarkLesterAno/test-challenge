import * as cheerio from 'cheerio';

async function SunvoyChallege() {
    const filePath = "users.json";
    const url = "https://challenge.sunvoy.com";

    const params = new URLSearchParams({
        username: "demo@example.org",
        password: "test",
        nonce: ""
    });

    let $ = cheerio.load("");
    let options: RequestInit = {
        method: "GET",
        headers: {
            "Content-Type": "text/html",
        },
    }
    const getNonce = await fetch(`${url}/login`, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            return response.text();
        });
    $ = cheerio.load(getNonce);
    const nonce: any = $('input[name="nonce"]').val();
    params.set("nonce", nonce);

    options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        redirect: "manual"
    }
    const response = await fetch(`${url}/login`, options);

    const cookies: any = response.headers.get("Set-Cookie");
    if (!cookies) {
        console.error("No cookie received");
        return;
    }

}