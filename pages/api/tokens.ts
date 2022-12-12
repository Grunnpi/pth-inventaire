import type { NextApiRequest, NextApiResponse } from 'next'

export default async function tokens(req: NextApiRequest, res: NextApiResponse) {
    console.log("TOOOOOOKENNNNn")
    res.status(200).json({ user: "Toto", email:"xx@xx.org" })
}