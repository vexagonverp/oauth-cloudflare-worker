enum RequestPathEnum {
	OAUTH_SIGNIN = 'oauth-signin',
	OAUTH_CODE = 'oauth-code',
}

export interface Env {
	OAUTH_CODE_CALLBACK: string;
	PORT: string;
	DEEPLINK: string;
	CLIENT_ID: string;
	CLIENT_SECRET: string;
}

export default {
	async fetch(request: Request, env: Env) {
		async function gatherResponse(response: Response) {
			const { headers } = response;
			const contentType = headers.get('content-type') || '';
			if (contentType.includes('application/json')) {
				return JSON.stringify(await response.json());
			} else if (contentType.includes('application/text')) {
				return response.text();
			} else if (contentType.includes('text/html')) {
				return response.text();
			} else {
				return response.text();
			}
		}
		const requestPath = new URL(request.url).pathname.split('/');
		switch (requestPath[1]) {
			case RequestPathEnum.OAUTH_SIGNIN: {
				return Response.redirect(
					`https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${env.OAUTH_CODE_CALLBACK}&prompt=consent&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets&client_id=${env.CLIENT_ID}&access_type=offline`,
					302
				);
			}
			case RequestPathEnum.OAUTH_CODE: {
				const { searchParams } = new URL(request.url);
				const body = {
					client_id: env.CLIENT_ID,
					client_secret: env.CLIENT_SECRET,
					code: searchParams.get('code'),
					grant_type: 'authorization_code',
					redirect_uri: `${env.OAUTH_CODE_CALLBACK}`,
				};
				const bodyPOST = {
					body: JSON.stringify(body),
					method: 'POST',
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				};
				const response = await fetch('https://oauth2.googleapis.com/token', bodyPOST);
				const result = await gatherResponse(response);
				return new Response(result);
			}
		}
		return new Response(`${request.method} not supported`);
	},
};
