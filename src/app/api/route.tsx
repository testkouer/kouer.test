import { NextApiRequest, NextApiResponse } from "next"

export const dynamic = 'force-dynamic' // defaults to force-static

export async function GET(req: NextApiRequest, res: NextApiResponse) {
	return Response.json("hello world");
  }
