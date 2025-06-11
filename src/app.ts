import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import crypto from 'crypto';

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

    options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookies
        }
    }
    const users = await fetch(`${url}/api/users`, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            return response.json();
        });
    console.log(`Writing users.json: ${users.length} users`);
    writeFile(filePath, JSON.stringify(users, null, 2), 'utf-8');

    options = {
        method: "GET",
        headers: {
            "Content-Type": "text/x-www-form-urlencoded",
            "Cookie": cookies
        },
        redirect: "manual"
    }
    const tokens = await fetch(`${url}/settings/tokens`, options)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }
            return response.text();
        });
    $ = cheerio.load(tokens);

    const access_token: any = $("#access_token").val();
    const openId: any = $("#openId").val();
    const userId: any = $("#userId").val();
    const apiuser: any = $("#apiuser").val();
    const operateId: any = $("#operateId").val();
    const language: any = $("#language").val();
    const timestamp = Math.floor(Date.now() / 1e3);

    const userParams: any = {
        access_token: access_token,
        openId: openId,
        userId: userId,
        apiuser: apiuser,
        operateId: operateId,
        language: language,
        timestamp: timestamp.toString()
    };
    const payload = Object.keys(userParams).sort().map((key) => `${key}=${encodeURIComponent(userParams[key])}`).join('&');
    const hmac = crypto.createHmac('sha1', 'mys3cr3t')
        .update(payload)
        .digest('hex').toUpperCase();
    const fullPayload = `${payload}&checkcode=${hmac}`;

}