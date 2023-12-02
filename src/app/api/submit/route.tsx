import { NextApiRequest, NextApiResponse } from "next";

export async function POST(request: NextApiRequest)
{
	const body = await request.body;
	if (!body)
		return Response.json({text: 'No body provided'});
	console.log(body.json());
}

export async function GET(req: NextApiRequest, res: NextApiResponse)
{
	return Response.json({text: "Submit works"});
}
